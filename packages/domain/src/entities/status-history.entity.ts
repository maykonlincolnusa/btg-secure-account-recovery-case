import { RecoveryStatus } from "../enums/recovery-status";

export type StatusHistoryProps = {
  id: string;
  recoveryRequestId: string;
  fromStatus?: RecoveryStatus | null;
  toStatus: RecoveryStatus;
  reason: string;
  actorType: "SYSTEM" | "USER" | "OPERATOR";
  actorId?: string | null;
  createdAt: Date;
};

export class StatusHistory {
  constructor(private readonly props: StatusHistoryProps) {}

  toJSON(): StatusHistoryProps {
    return { ...this.props };
  }
}
