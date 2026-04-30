export type ContactChangeRequestProps = {
  id: string;
  recoveryRequestId: string;
  newEmailMasked: string;
  newPhoneMasked: string;
  status: "PENDING" | "APPLIED" | "FAILED";
  executedAt?: Date | null;
  createdAt: Date;
};

export class ContactChangeRequest {
  constructor(private readonly props: ContactChangeRequestProps) {}

  toJSON(): ContactChangeRequestProps {
    return { ...this.props };
  }
}
