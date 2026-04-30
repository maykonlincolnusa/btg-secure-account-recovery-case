export const RecoveryStatus = {
  INITIATED: "INITIATED",
  IDENTITY_PENDING: "IDENTITY_PENDING",
  FACE_VERIFIED: "FACE_VERIFIED",
  LIVENESS_VERIFIED: "LIVENESS_VERIFIED",
  RISK_EVALUATING: "RISK_EVALUATING",
  STEP_UP_REQUIRED: "STEP_UP_REQUIRED",
  UNDER_REVIEW: "UNDER_REVIEW",
  COOLDOWN: "COOLDOWN",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export type RecoveryStatus = (typeof RecoveryStatus)[keyof typeof RecoveryStatus];

export const terminalRecoveryStatuses = new Set<RecoveryStatus>([
  RecoveryStatus.REJECTED,
  RecoveryStatus.COMPLETED,
  RecoveryStatus.FAILED
]);
