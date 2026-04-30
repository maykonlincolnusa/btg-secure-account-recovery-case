import { RiskLevel, SuggestedDecision } from "../enums/risk-level";
import type { RiskReason } from "./recovery-request.entity";

export type RiskSignals = {
  newDevice?: boolean;
  unusualIp?: boolean;
  geoMismatch?: boolean;
  repeatedAttempts?: number;
  sensitiveContactChange?: boolean;
  faceMatchFailed?: boolean;
  livenessFailed?: boolean;
  anomalousBehavior?: boolean;
  recentRecoveryRequests?: number;
};

export type RiskAssessmentProps = {
  id: string;
  recoveryRequestId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  suggestedDecision: SuggestedDecision;
  reasons: RiskReason[];
  signals: RiskSignals;
  createdAt: Date;
};

export class RiskAssessment {
  constructor(private readonly props: RiskAssessmentProps) {}

  toJSON(): RiskAssessmentProps {
    return { ...this.props };
  }
}
