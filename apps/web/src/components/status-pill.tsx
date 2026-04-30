import { statusLabels } from "@secure-recovery/ui";

const colors: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
  COOLDOWN: "bg-amber-100 text-amber-900",
  UNDER_REVIEW: "bg-indigo-100 text-indigo-800",
  STEP_UP_REQUIRED: "bg-sky-100 text-sky-800"
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${colors[status] ?? "bg-zinc-100 text-zinc-800"}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
