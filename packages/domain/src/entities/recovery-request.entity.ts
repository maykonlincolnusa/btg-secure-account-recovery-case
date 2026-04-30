import { RecoveryStatus } from "../enums/recovery-status";
import { RiskLevel, SuggestedDecision } from "../enums/risk-level";
import { canTransition } from "../services/recovery-state-machine";

export type RiskReason = {
  code: string;
  description: string;
  weight: number;
};

export type RecoveryRequestProps = {
  id: string;
  protocolId: string;
  userId: string;
  status: RecoveryStatus;
  riskScore?: number | null;
  riskLevel?: RiskLevel | null;
  suggestedDecision?: SuggestedDecision | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
};

export class RecoveryRequest {
  constructor(private readonly props: RecoveryRequestProps) {}

  get id() {
    return this.props.id;
  }

  get protocolId() {
    return this.props.protocolId;
  }

  get status() {
    return this.props.status;
  }

  transitionTo(nextStatus: RecoveryStatus, reason: string) {
    if (!canTransition(this.props.status, nextStatus)) {
      throw new Error(
        `Invalid recovery transition from ${this.props.status} to ${nextStatus}: ${reason}`
      );
    }

    this.props.status = nextStatus;
    this.props.updatedAt = new Date();
    if (nextStatus === RecoveryStatus.COMPLETED) {
      this.props.completedAt = this.props.updatedAt;
    }
  }

  assertContactChangeAllowed() {
    if (
      this.props.status !== RecoveryStatus.APPROVED &&
      this.props.status !== RecoveryStatus.COMPLETED
    ) {
      throw new Error("Sensitive contact change requires positive risk/manual decision first");
    }
  }

  toJSON(): RecoveryRequestProps {
    return { ...this.props };
  }
}
