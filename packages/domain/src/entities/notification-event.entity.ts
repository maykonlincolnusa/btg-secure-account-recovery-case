export type NotificationEventProps = {
  id: string;
  recoveryRequestId: string;
  channel: "EMAIL" | "SMS" | "IN_APP";
  template: string;
  recipientMasked: string;
  status: "QUEUED" | "SENT" | "FAILED";
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export class NotificationEvent {
  constructor(private readonly props: NotificationEventProps) {}

  toJSON(): NotificationEventProps {
    return { ...this.props };
  }
}
