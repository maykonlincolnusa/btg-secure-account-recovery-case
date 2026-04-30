import { RecoveryStatus, terminalRecoveryStatuses } from "../enums/recovery-status";

const transitions: Record<RecoveryStatus, RecoveryStatus[]> = {
  [RecoveryStatus.INITIATED]: [RecoveryStatus.IDENTITY_PENDING, RecoveryStatus.FAILED],
  [RecoveryStatus.IDENTITY_PENDING]: [RecoveryStatus.FACE_VERIFIED, RecoveryStatus.REJECTED, RecoveryStatus.FAILED],
  [RecoveryStatus.FACE_VERIFIED]: [RecoveryStatus.LIVENESS_VERIFIED, RecoveryStatus.REJECTED, RecoveryStatus.FAILED],
  [RecoveryStatus.LIVENESS_VERIFIED]: [RecoveryStatus.RISK_EVALUATING, RecoveryStatus.FAILED],
  [RecoveryStatus.RISK_EVALUATING]: [
    RecoveryStatus.APPROVED,
    RecoveryStatus.STEP_UP_REQUIRED,
    RecoveryStatus.UNDER_REVIEW,
    RecoveryStatus.COOLDOWN,
    RecoveryStatus.REJECTED,
    RecoveryStatus.FAILED
  ],
  [RecoveryStatus.STEP_UP_REQUIRED]: [
    RecoveryStatus.APPROVED,
    RecoveryStatus.UNDER_REVIEW,
    RecoveryStatus.REJECTED,
    RecoveryStatus.FAILED
  ],
  [RecoveryStatus.UNDER_REVIEW]: [
    RecoveryStatus.APPROVED,
    RecoveryStatus.REJECTED,
    RecoveryStatus.COOLDOWN,
    RecoveryStatus.FAILED
  ],
  [RecoveryStatus.COOLDOWN]: [
    RecoveryStatus.UNDER_REVIEW,
    RecoveryStatus.APPROVED,
    RecoveryStatus.REJECTED,
    RecoveryStatus.FAILED
  ],
  [RecoveryStatus.APPROVED]: [RecoveryStatus.COMPLETED, RecoveryStatus.FAILED],
  [RecoveryStatus.REJECTED]: [],
  [RecoveryStatus.COMPLETED]: [],
  [RecoveryStatus.FAILED]: []
};

export function canTransition(from: RecoveryStatus, to: RecoveryStatus): boolean {
  if (from === to) {
    return true;
  }

  if (terminalRecoveryStatuses.has(from)) {
    return false;
  }

  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: RecoveryStatus, to: RecoveryStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid recovery transition from ${from} to ${to}`);
  }
}

export function nextStatuses(from: RecoveryStatus): RecoveryStatus[] {
  return [...(transitions[from] ?? [])];
}
