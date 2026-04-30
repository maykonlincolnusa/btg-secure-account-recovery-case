"use client";

import { Check, FileText, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, getDemoAdminRequest, type AdminRecoveryRequest } from "../../../lib/api";
import { StatusPill } from "../../../components/status-pill";

export default function AdminRecoveryDetailPage() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const [data, setData] = useState<AdminRecoveryRequest | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("Identidade e evidências revisadas");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setData(await apiRequest<AdminRecoveryRequest>(`/api/admin/recovery/requests/${protocolId}`));
  }

  async function action(path: string, body: unknown) {
    setError(null);
    try {
      const updated = await apiRequest<AdminRecoveryRequest>(path, {
        method: "POST",
        body: JSON.stringify(body)
      });
      setData(updated);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na ação");
    }
  }

  useEffect(() => {
    void load().catch((err) => {
      setData(getDemoAdminRequest(protocolId));
      setError(
        err instanceof Error
          ? `API offline ou indisponivel: ${err.message}. Exibindo detalhe demo.`
          : "API offline ou indisponivel. Exibindo detalhe demo."
      );
    });
  }, [protocolId]);

  if (!data) {
    return <main className="p-8 text-sm text-zinc-600">Carregando...</main>;
  }

  const latestRisk = data.riskAssessments?.[0];

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Detalhe operacional</p>
            <h1 className="text-2xl font-semibold">{data.protocolId}</h1>
          </div>
          <StatusPill status={data.status} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Decisão manual</h2>
          <label className="mt-4 grid gap-1 text-sm">
            Motivo
            <input className="rounded border border-zinc-300 px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
          <label className="mt-3 grid gap-1 text-sm">
            Nota operacional
            <textarea className="min-h-28 rounded border border-zinc-300 px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button className="inline-flex items-center justify-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" onClick={() => void action(`/api/admin/recovery/requests/${protocolId}/approve`, { operatorId: "operator-demo", reason, note })}>
              <Check className="h-4 w-4" /> Aprovar
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white" onClick={() => void action(`/api/admin/recovery/requests/${protocolId}/reject`, { operatorId: "operator-demo", reason, note })}>
              <X className="h-4 w-4" /> Rejeitar
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded border border-zinc-300 px-3 py-2 text-sm" onClick={() => void action(`/api/admin/recovery/requests/${protocolId}/note`, { operatorId: "operator-demo", note })}>
              <FileText className="h-4 w-4" /> Nota
            </button>
          </div>
          {error ? <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Sinais de risco</h2>
          {latestRisk ? (
            <div className="mt-4 grid gap-3 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <span className="rounded border px-3 py-2">Score {latestRisk.riskScore}</span>
                <span className="rounded border px-3 py-2">{latestRisk.riskLevel}</span>
                <span className="rounded border px-3 py-2">{latestRisk.suggestedDecision}</span>
              </div>
              <ul className="grid gap-2">
                {latestRisk.reasons.map((reason) => (
                  <li key={reason.code} className="rounded border border-zinc-200 px-3 py-2">{reason.code}: {reason.description}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">Sem avaliação registrada.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Histórico</h2>
          <ol className="mt-4 grid gap-2 text-sm">
            {data.statusHistory?.map((item, index) => (
              <li key={`${item.toStatus}-${index}`} className="rounded border border-zinc-200 px-3 py-2">
                {item.fromStatus ?? "START"} → {item.toStatus}: {item.reason}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Auditoria</h2>
          <ol className="mt-4 grid gap-2 text-sm">
            {data.auditEvents?.map((event, index) => (
              <li key={`${event.action}-${index}`} className="rounded border border-zinc-200 px-3 py-2">
                <strong>{event.action}</strong> · {event.actorType}
                <p className="text-zinc-600">{event.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
