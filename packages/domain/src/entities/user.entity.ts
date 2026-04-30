export type UserProps = {
  id: string;
  accountIdentifier: string;
  maskedEmail?: string | null;
  maskedPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  constructor(private readonly props: UserProps) {}

  get id() {
    return this.props.id;
  }

  get accountIdentifier() {
    return this.props.accountIdentifier;
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
