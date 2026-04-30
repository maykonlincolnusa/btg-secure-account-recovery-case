export type VerificationAttemptType = "FACE_MATCH" | "LIVENESS" | "STEP_UP";

export type VerificationAttemptProps = {
  id: string;
  recoveryRequestId: string;
  type: VerificationAttemptType;
  provider: string;
  success: boolean;
  score?: number | null;
  reasonCode?: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export class VerificationAttempt {
  constructor(private readonly props: VerificationAttemptProps) {}

  toJSON(): VerificationAttemptProps {
    return { ...this.props };
  }
}
