type EnvMap = Record<string, string | undefined>;

type JsonObject = Record<string, unknown>;

export type GitHubWebhookStubConfig = {
  enabled: boolean;
  requiredSecret: string | null;
};

export type ValidGitHubWebhookPayload = {
  action: string | null;
  repositoryFullName: string;
};

type ValidationResult =
  | {
      ok: true;
      value: ValidGitHubWebhookPayload;
    }
  | {
      ok: false;
      error: string;
    };

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function toJsonResponse(status: number, body: JsonObject): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getGitHubWebhookStubConfig(env: EnvMap = process.env): GitHubWebhookStubConfig {
  const enabledRaw = env.GITHUB_WEBHOOK_STUB_ENABLED?.trim().toLowerCase() ?? '';
  const enabled = TRUE_VALUES.has(enabledRaw);

  const secretRaw = env.GITHUB_WEBHOOK_STUB_SECRET?.trim();
  const requiredSecret = secretRaw && secretRaw.length > 0 ? secretRaw : null;

  return {
    enabled,
    requiredSecret,
  };
}

export function validateGitHubWebhookPayload(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return {
      ok: false,
      error: 'Payload must be a JSON object.',
    };
  }

  const repository = payload.repository;
  if (!isRecord(repository)) {
    return {
      ok: false,
      error: 'Payload must include repository metadata.',
    };
  }

  const repositoryFullName = getString(repository.full_name);
  if (!repositoryFullName) {
    return {
      ok: false,
      error: 'Payload repository.full_name is required.',
    };
  }

  const actionRaw = payload.action;
  if (actionRaw !== undefined && actionRaw !== null && typeof actionRaw !== 'string') {
    return {
      ok: false,
      error: 'Payload action must be a string when present.',
    };
  }

  return {
    ok: true,
    value: {
      action: getString(actionRaw),
      repositoryFullName,
    },
  };
}

export async function handleGitHubWebhookStubRequest(
  request: Request,
  env: EnvMap = process.env,
): Promise<Response> {
  const config = getGitHubWebhookStubConfig(env);

  if (!config.enabled) {
    return toJsonResponse(503, {
      ok: false,
      status: 'not_enabled',
      message: 'GitHub webhook stub is disabled. Set GITHUB_WEBHOOK_STUB_ENABLED=true to enable it.',
    });
  }

  if (config.requiredSecret) {
    const signature = getString(request.headers.get('x-hub-signature-256'));
    if (!signature) {
      return toJsonResponse(401, {
        ok: false,
        status: 'signature_missing',
        message: 'Webhook signature is required when GITHUB_WEBHOOK_STUB_SECRET is set.',
      });
    }
  }

  const eventName = getString(request.headers.get('x-github-event'));
  if (!eventName) {
    return toJsonResponse(400, {
      ok: false,
      status: 'invalid_request',
      message: 'Missing x-github-event header.',
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return toJsonResponse(400, {
      ok: false,
      status: 'invalid_json',
      message: 'Request body must be valid JSON.',
    });
  }

  const validation = validateGitHubWebhookPayload(payload);
  if (!validation.ok) {
    return toJsonResponse(400, {
      ok: false,
      status: 'invalid_payload',
      message: validation.error,
    });
  }

  const deliveryId = getString(request.headers.get('x-github-delivery'));

  return toJsonResponse(202, {
    ok: true,
    status: 'stub_received',
    message: 'Webhook accepted by stub endpoint. No CI or PR action is executed yet.',
    event: eventName,
    action: validation.value.action,
    repository: validation.value.repositoryFullName,
    deliveryId,
    nextStep: 'Future slice will connect this endpoint to CI gating and PR comment automation.',
  });
}
