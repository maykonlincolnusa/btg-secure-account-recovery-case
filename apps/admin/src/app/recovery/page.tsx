"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest, demoAdminRequest, type AdminRecoveryRequest } from "../../lib/api";
import { StatusPill } from "../../components/status-pill";

export default function AdminRecoveryPage() {
  const [rows, setRows] = useState<AdminRecoveryRequest[]>([]);
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");
  const [protocol, setProtocol] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (risk) params.set("risk", risk);
    if (protocol) params.set("protocol", protocol);
    const data = await apiRequest<AdminRecoveryRequest[]>(`/api/admin/recovery/requests?${params.toString()}`);
    setRows(data);
  }

  useEffect(() => {
    void load().catch((err) => {
      setRows([demoAdminRequest]);
      setError(
        err instanceof Error
          ? `API offline ou indisponivel: ${err.message}. Exibindo dados demo.`
          : "API offline ou indisponivel. Exibindo dados demo."
      );
    });
  }, []);

  return (
    <main className="min-h-screen">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-xl font-semibold">Operações de recuperação</h1>
          <p className="text-sm text-zinc-600">Fila operacional, sinais de risco e decisões manuais.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_160px_auto]">
          <input className="rounded border border-zinc-300 px-3 py-2 text-sm" placeholder="Protocolo" value={protocol} onChange={(event) => setProtocol(event.target.value)} />
          <select className="rounded border border-zinc-300 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos status</option>
            <option value="UNDER_REVIEW">Em revisão</option>
            <option value="COOLDOWN">Cooldown</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
          </select>
          <select className="rounded border border-zinc-300 px-3 py-2 text-sm" value={risk} onChange={(event) => setRisk(event.target.value)}>
            <option value="">Todos riscos</option>
            <option value="LOW">Baixo</option>
            <option value="MEDIUM">Médio</option>
            <option value="HIGH">Alto</option>
            <option value="CRITICAL">Crítico</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => void load()}>
            <Search className="h-4 w-4" /> Filtrar
          </button>
        </div>
        {error ? <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Conta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Risco</th>
                <th className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.protocolId} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium"><Link href={`/recovery/${row.protocolId}`}>{row.protocolId}</Link></td>
                  <td className="px-4 py-3">{row.user.accountIdentifier}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3">{row.riskAssessments?.[0]?.riskLevel ?? "N/A"}</td>
                  <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Nenhuma solicitação encontrada.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
