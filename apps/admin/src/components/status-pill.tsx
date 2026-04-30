import { statusLabels } from "@secure-recovery/ui";

export function StatusPill({ status }: { status: string }) {
  const className =
    status === "APPROVED" || status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-800"
      : status === "REJECTED" || status === "FAILED"
        ? "bg-red-100 text-red-800"
        : status === "COOLDOWN"
          ? "bg-amber-100 text-amber-900"
          : "bg-zinc-100 text-zinc-800";

  return <span className={`rounded px-2.5 py-1 text-xs font-semibold ${className}`}>{statusLabels[status] ?? status}</span>;
}
