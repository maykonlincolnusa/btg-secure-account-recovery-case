export const RiskLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL"
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const SuggestedDecision = {
  AUTO_APPROVE: "AUTO_APPROVE",
  STEP_UP: "STEP_UP",
  HOLD: "HOLD",
  REJECT: "REJECT"
} as const;

export type SuggestedDecision = (typeof SuggestedDecision)[keyof typeof SuggestedDecision];
