const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type RecoverySummary = {
  protocolId: string;
  status: string;
  targetEmailMasked?: string | null;
  targetPhoneMasked?: string | null;
  cooldownUntil?: string | null;
  risk?: {
    riskScore: number;
    riskLevel: string;
    suggestedDecision: string;
    reasons: { code: string; description: string; weight: number }[];
  } | null;
  decisions: { decision: string; reason: string; note?: string | null; createdAt: string }[];
  history: { fromStatus?: string | null; toStatus: string; reason: string; createdAt: string }[];
  createdAt: string;
  completedAt?: string | null;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-request-id": crypto.randomUUID(),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}
