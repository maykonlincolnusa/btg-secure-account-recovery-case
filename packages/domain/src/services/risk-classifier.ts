import { RiskLevel, SuggestedDecision } from "../enums/risk-level";
import type { RiskReason } from "../entities/recovery-request.entity";
import type { RiskSignals } from "../entities/risk-assessment.entity";

type WeightedSignal = {
  key: keyof RiskSignals;
  code: string;
  description: string;
  weight: number;
};

const weightedSignals: WeightedSignal[] = [
  { key: "newDevice", code: "NEW_DEVICE", description: "Dispositivo não reconhecido", weight: 15 },
  { key: "unusualIp", code: "UNUSUAL_IP", description: "IP incomum para a conta", weight: 20 },
  { key: "geoMismatch", code: "GEO_MISMATCH", description: "Geolocalização incompatível", weight: 20 },
  {
    key: "sensitiveContactChange",
    code: "SENSITIVE_CONTACT_CHANGE",
    description: "Alteração de dados sensíveis solicitada",
    weight: 15
  },
  { key: "faceMatchFailed", code: "FACE_FAILED", description: "FaceMatch falhou", weight: 40 },
  { key: "livenessFailed", code: "LIVENESS_FAILED", description: "Liveness falhou", weight: 45 },
  { key: "anomalousBehavior", code: "ANOMALOUS_BEHAVIOR", description: "Comportamento anômalo", weight: 25 }
];

export type RiskClassification = {
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: RiskReason[];
  suggestedDecision: SuggestedDecision;
};

export function classifyRisk(signals: RiskSignals): RiskClassification {
  const reasons: RiskReason[] = [];
  let riskScore = 0;

  for (const signal of weightedSignals) {
    if (signals[signal.key]) {
      reasons.push({
        code: signal.code,
        description: signal.description,
        weight: signal.weight
      });
      riskScore += signal.weight;
    }
  }

  if ((signals.repeatedAttempts ?? 0) >= 3) {
    const weight = Math.min(30, (signals.repeatedAttempts ?? 0) * 5);
    reasons.push({
      code: "REPEATED_ATTEMPTS",
      description: "Tentativas repetidas em janela curta",
      weight
    });
    riskScore += weight;
  }

  if ((signals.recentRecoveryRequests ?? 0) >= 2) {
    const weight = Math.min(25, (signals.recentRecoveryRequests ?? 0) * 8);
    reasons.push({
      code: "RECENT_RECOVERY_REQUESTS",
      description: "Solicitações recentes para a mesma conta",
      weight
    });
    riskScore += weight;
  }

  riskScore = Math.min(100, riskScore);

  if (signals.faceMatchFailed || signals.livenessFailed || riskScore >= 90) {
    return {
      riskScore,
      riskLevel: RiskLevel.CRITICAL,
      riskReasons: reasons,
      suggestedDecision: SuggestedDecision.REJECT
    };
  }

  if (riskScore >= 65) {
    return {
      riskScore,
      riskLevel: RiskLevel.HIGH,
      riskReasons: reasons,
      suggestedDecision: SuggestedDecision.HOLD
    };
  }

  if (riskScore >= 35) {
    return {
      riskScore,
      riskLevel: RiskLevel.MEDIUM,
      riskReasons: reasons,
      suggestedDecision: SuggestedDecision.STEP_UP
    };
  }

  return {
    riskScore,
    riskLevel: RiskLevel.LOW,
    riskReasons: reasons,
    suggestedDecision: SuggestedDecision.AUTO_APPROVE
  };
}
