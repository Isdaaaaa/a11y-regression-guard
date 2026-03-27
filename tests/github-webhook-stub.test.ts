import { describe, expect, it } from 'vitest';
import {
  getGitHubWebhookStubConfig,
  handleGitHubWebhookStubRequest,
  validateGitHubWebhookPayload,
} from '@/lib/github-webhook-stub';

describe('getGitHubWebhookStubConfig', () => {
  it('defaults to disabled with no required secret', () => {
    expect(getGitHubWebhookStubConfig({})).toEqual({
      enabled: false,
      requiredSecret: null,
    });
  });

  it('enables the stub from a truthy env value', () => {
    expect(
      getGitHubWebhookStubConfig({
        GITHUB_WEBHOOK_STUB_ENABLED: 'true',
        GITHUB_WEBHOOK_STUB_SECRET: 'my-secret',
      }),
    ).toEqual({
      enabled: true,
      requiredSecret: 'my-secret',
    });
  });
});

describe('validateGitHubWebhookPayload', () => {
  it('accepts minimal repository payload', () => {
    const result = validateGitHubWebhookPayload({
      repository: {
        full_name: 'octo-org/a11y-regression-guard',
      },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        action: null,
        repositoryFullName: 'octo-org/a11y-regression-guard',
      },
    });
  });

  it('rejects payload without repository.full_name', () => {
    const result = validateGitHubWebhookPayload({ repository: {} });

    expect(result).toEqual({
      ok: false,
      error: 'Payload repository.full_name is required.',
    });
  });
});

describe('handleGitHubWebhookStubRequest', () => {
  async function readJson(response: Response) {
    return (await response.json()) as Record<string, unknown>;
  }

  it('returns not enabled when flag is not set', async () => {
    const request = new Request('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ repository: { full_name: 'octo-org/a11y-regression-guard' } }),
    });

    const response = await handleGitHubWebhookStubRequest(request, {});

    expect(response.status).toBe(503);
    await expect(readJson(response)).resolves.toMatchObject({
      ok: false,
      status: 'not_enabled',
    });
  });

  it('returns validation error for missing GitHub event header', async () => {
    const request = new Request('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ repository: { full_name: 'octo-org/a11y-regression-guard' } }),
    });

    const response = await handleGitHubWebhookStubRequest(request, {
      GITHUB_WEBHOOK_STUB_ENABLED: 'true',
    });

    expect(response.status).toBe(400);
    await expect(readJson(response)).resolves.toMatchObject({
      ok: false,
      status: 'invalid_request',
    });
  });

  it('accepts valid webhook payload in stub mode', async () => {
    const request = new Request('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-123',
      },
      body: JSON.stringify({
        action: 'opened',
        repository: { full_name: 'octo-org/a11y-regression-guard' },
      }),
    });

    const response = await handleGitHubWebhookStubRequest(request, {
      GITHUB_WEBHOOK_STUB_ENABLED: '1',
    });

    expect(response.status).toBe(202);
    await expect(readJson(response)).resolves.toMatchObject({
      ok: true,
      status: 'stub_received',
      event: 'pull_request',
      action: 'opened',
      repository: 'octo-org/a11y-regression-guard',
      deliveryId: 'delivery-123',
    });
  });

  it('requires signature header when a secret is configured', async () => {
    const request = new Request('http://localhost/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'workflow_run',
      },
      body: JSON.stringify({ repository: { full_name: 'octo-org/a11y-regression-guard' } }),
    });

    const response = await handleGitHubWebhookStubRequest(request, {
      GITHUB_WEBHOOK_STUB_ENABLED: 'true',
      GITHUB_WEBHOOK_STUB_SECRET: 'required-secret',
    });

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toMatchObject({
      ok: false,
      status: 'signature_missing',
    });
  });
});
