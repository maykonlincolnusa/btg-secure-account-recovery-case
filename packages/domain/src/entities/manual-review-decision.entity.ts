export type ManualReviewDecisionProps = {
  id: string;
  recoveryRequestId: string;
  decision: "APPROVED" | "REJECTED" | "NOTE";
  operatorId: string;
  reason: string;
  note?: string | null;
  createdAt: Date;
};

export class ManualReviewDecision {
  constructor(private readonly props: ManualReviewDecisionProps) {}

  toJSON(): ManualReviewDecisionProps {
    return { ...this.props };
  }
}
