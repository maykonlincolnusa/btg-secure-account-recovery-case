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

export const demoAdminRequest: AdminRecoveryRequest = {
  protocolId: "SR-20260430-DEMO01",
  status: "UNDER_REVIEW",
  targetEmailMasked: "no***@example.com",
  targetPhoneMasked: "+55******2222",
  cooldownUntil: null,
  user: {
    accountIdentifier: "demo-account-001",
    maskedEmail: "jo***@example.com",
    maskedPhone: "+55******0001"
  },
  riskAssessments: [
    {
      riskScore: 70,
      riskLevel: "HIGH",
      suggestedDecision: "HOLD",
      reasons: [
        {
          code: "NEW_DEVICE",
          description: "Dispositivo nao reconhecido",
          weight: 15
        },
        {
          code: "UNUSUAL_IP",
          description: "IP incomum para a conta",
          weight: 20
        },
        {
          code: "SENSITIVE_CONTACT_CHANGE",
          description: "Alteracao de dados sensiveis solicitada",
          weight: 15
        },
        {
          code: "RECENT_RECOVERY_REQUESTS",
          description: "Solicitacoes recentes para a mesma conta",
          weight: 20
        }
      ],
      signals: {
        newDevice: true,
        unusualIp: true,
        sensitiveContactChange: true,
        recentRecoveryRequests: 3
      },
      createdAt: new Date().toISOString()
    }
  ],
  auditEvents: [
    {
      action: "RECOVERY_REQUEST_CREATED",
      summary: "Solicitacao criada com dados mascarados",
      actorType: "USER",
      createdAt: new Date().toISOString(),
      metadata: {}
    },
    {
      action: "RISK_ASSESSED",
      summary: "Risco HIGH com decisao HOLD",
      actorType: "SYSTEM",
      createdAt: new Date().toISOString(),
      metadata: { riskScore: 70 }
    }
  ],
  statusHistory: [
    {
      fromStatus: "INITIATED",
      toStatus: "IDENTITY_PENDING",
      reason: "Solicitacao criada com consentimento",
      createdAt: new Date().toISOString()
    },
    {
      fromStatus: "RISK_EVALUATING",
      toStatus: "UNDER_REVIEW",
      reason: "Risco alto encaminhado para revisao manual",
      createdAt: new Date().toISOString()
    }
  ],
  manualDecisions: [
    {
      decision: "NOTE",
      operatorId: "operator-demo",
      reason: "Nota operacional",
      note: "Caso demonstrativo para avaliacao do fluxo administrativo.",
      createdAt: new Date().toISOString()
    }
  ],
  createdAt: new Date().toISOString()
};

export function getDemoAdminRequest(protocolId: string): AdminRecoveryRequest {
  return { ...demoAdminRequest, protocolId };
}

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
