"use client";

import { Activity, Check, RefreshCw, ShieldAlert, UserCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, type RecoverySummary } from "../../../lib/api";
import { StatusPill } from "../../../components/status-pill";

export default function RecoveryDetailPage() {
  const params = useParams<{ protocolId: string }>();
  const protocolId = params.protocolId;
  const [request, setRequest] = useState<RecoverySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await apiRequest<RecoverySummary>(`/api/recovery/requests/${protocolId}`);
    setRequest(data);
  }

  async function run(label: string, path: string, body?: unknown) {
    setBusy(label);
    setError(null);
    try {
      const data = await apiRequest<RecoverySummary>(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
        headers: { "Idempotency-Key": `${label}-${protocolId}` }
      });
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na ação");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, [protocolId]);

  if (!request) {
    return <main className="p-8 text-sm text-zinc-600">Carregando protocolo...</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">Protocolo</p>
            <h1 className="text-2xl font-semibold">{request.protocolId}</h1>
          </div>
          <StatusPill status={request.status} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Ações de demonstração</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm" disabled={!!busy} onClick={() => run("face", `/api/recovery/requests/${protocolId}/face-match`, { selfieImageRef: "mock-selfie-ref", mockOutcome: "PASS" })}>
              <UserCheck className="h-4 w-4" /> FaceMatch
            </button>
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm" disabled={!!busy} onClick={() => run("liveness", `/api/recovery/requests/${protocolId}/liveness`, { challengeId: "blink", captureRef: "mock-capture-ref", mockOutcome: "PASS" })}>
              <Activity className="h-4 w-4" /> Liveness
            </button>
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm" disabled={!!busy} onClick={() => run("risk", `/api/recovery/requests/${protocolId}/risk-assessment`, { signals: { newDevice: false, unusualIp: false, sensitiveContactChange: true } })}>
              <ShieldAlert className="h-4 w-4" /> Avaliar risco baixo
            </button>
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm" disabled={!!busy} onClick={() => run("submit", `/api/recovery/requests/${protocolId}/submit`)}>
              <RefreshCw className="h-4 w-4" /> Submeter
            </button>
            <button className="inline-flex items-center gap-2 rounded bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2" disabled={!!busy} onClick={() => run("contact", `/api/recovery/requests/${protocolId}/contact-change`, { newEmail: "novo@example.com", newPhone: "+551198882222", replayNonce: crypto.randomUUID() })}>
              <Check className="h-4 w-4" /> Aplicar alteração de contato
            </button>
          </div>
          {busy ? <p className="mt-4 text-sm text-zinc-600">Executando {busy}...</p> : null}
          {error ? <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Decisão e risco</h2>
          {request.risk ? (
            <div className="mt-4 grid gap-3">
              <p className="text-sm">Score: <strong>{request.risk.riskScore}</strong></p>
              <p className="text-sm">Nível: <strong>{request.risk.riskLevel}</strong></p>
              <p className="text-sm">Decisão sugerida: <strong>{request.risk.suggestedDecision}</strong></p>
              <ul className="grid gap-2 text-sm text-zinc-700">
                {request.risk.reasons.map((reason) => (
                  <li key={reason.code} className="rounded border border-zinc-200 px-3 py-2">
                    {reason.code}: {reason.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">Risco ainda não avaliado.</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold">Histórico de estados</h2>
          <ol className="mt-4 grid gap-3">
            {request.history.map((item, index) => (
              <li key={`${item.toStatus}-${index}`} className="grid gap-1 rounded border border-zinc-200 px-3 py-2 text-sm">
                <span><strong>{item.fromStatus ?? "START"}</strong> para <strong>{item.toStatus}</strong></span>
                <span className="text-zinc-600">{item.reason}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
