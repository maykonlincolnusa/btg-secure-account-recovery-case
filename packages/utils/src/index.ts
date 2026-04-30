export function maskEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  const [name, domain] = email.split("@");
  if (!name || !domain) {
    return "***";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone?: string | null): string | null {
  if (!phone) {
    return null;
  }

  const suffix = phone.slice(-4);
  return `${phone.slice(0, 3)}******${suffix}`;
}

export function redactSensitive(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const sensitiveKeys = new Set(["email", "phone", "targetEmail", "targetPhone", "previousEmail", "previousPhone"]);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKeys.has(key) ? "[REDACTED]" : entry
    ])
  );
}

export function createProtocolId(now = new Date(), random = Math.random()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.floor(random * 36 ** 6)
    .toString(36)
    .padStart(6, "0")
    .toUpperCase();
  return `SR-${date}-${suffix}`;
}
