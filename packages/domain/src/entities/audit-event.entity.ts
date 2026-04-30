export type AuditActorType = "SYSTEM" | "USER" | "OPERATOR";

export type AuditEventProps = {
  id: string;
  recoveryRequestId?: string | null;
  actorType: AuditActorType;
  actorId?: string | null;
  action: string;
  summary: string;
  metadata: Record<string, unknown>;
  requestId?: string | null;
  createdAt: Date;
};

export class AuditEvent {
  constructor(private readonly props: AuditEventProps) {}

  toJSON(): AuditEventProps {
    return { ...this.props };
  }
}
