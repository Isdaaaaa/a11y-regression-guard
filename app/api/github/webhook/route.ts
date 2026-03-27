import { handleGitHubWebhookStubRequest } from '@/lib/github-webhook-stub';

export async function POST(request: Request) {
  return handleGitHubWebhookStubRequest(request);
}
