const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type AdminRecoveryRequest = {
  protocolId: string;
  status: string;
  targetEmailMasked?: string | null;
  targetPhoneMasked?: string | null;
  cooldownUntil?: string | null;
  user: { accountIdentifier: string; maskedEmail?: string | null; maskedPhone?: string | null };
  riskAssessments?: Array<{
    riskScore: number;
    riskLevel: string;
    suggestedDecision: string;
    reasons: Array<{ code: string; description: string; weight: number }>;
    signals: Record<string, unknown>;
    createdAt: string;
  }>;
  auditEvents?: Array<{ action: string; summary: string; actorType: string; createdAt: string; metadata: unknown }>;
  statusHistory?: Array<{ fromStatus?: string | null; toStatus: string; reason: string; createdAt: string }>;
  manualDecisions?: Array<{ decision: string; operatorId: string; reason: string; note?: string | null; createdAt: string }>;
  createdAt: string;
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
