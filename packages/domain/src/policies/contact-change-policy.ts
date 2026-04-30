import { RecoveryStatus } from "../enums/recovery-status";
import { RiskLevel, SuggestedDecision } from "../enums/risk-level";

export type ContactChangeGate = {
  status: RecoveryStatus;
  faceVerified: boolean;
  livenessVerified: boolean;
  riskLevel?: RiskLevel | null;
  suggestedDecision?: SuggestedDecision | null;
  manualApproval?: boolean;
};

export function canApplySensitiveContactChange(gate: ContactChangeGate): boolean {
  if (!gate.faceVerified || !gate.livenessVerified) {
    return false;
  }

  if (gate.manualApproval) {
    return gate.status === RecoveryStatus.APPROVED;
  }

  return (
    gate.status === RecoveryStatus.APPROVED &&
    gate.riskLevel === RiskLevel.LOW &&
    gate.suggestedDecision === SuggestedDecision.AUTO_APPROVE
  );
}
