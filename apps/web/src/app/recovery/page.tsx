"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createRecoveryRequestSchema, type CreateRecoveryRequestInput } from "@secure-recovery/contracts";
import { apiRequest, type RecoverySummary } from "../../lib/api";

export default function RecoveryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CreateRecoveryRequestInput>({
    resolver: zodResolver(createRecoveryRequestSchema),
    defaultValues: {
      accountIdentifier: "demo-account-001",
      previousEmail: "joao@example.com",
      previousPhone: "+551199990001",
      targetEmail: "novo@example.com",
      targetPhone: "+551198882222",
      consentAccepted: true,
      deviceFingerprint: "demo-browser-device"
    }
  });

  async function onSubmit(values: CreateRecoveryRequestInput) {
    setSubmitting(true);
    setError(null);
    try {
      const data = await apiRequest<RecoverySummary>("/api/recovery/requests", {
        method: "POST",
        headers: { "Idempotency-Key": `web-${values.accountIdentifier}-${values.deviceFingerprint}` },
        body: JSON.stringify(values)
      });
      router.push(`/recovery/${data.protocolId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar solicitação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
          <ShieldCheck className="h-6 w-6 text-emerald-700" aria-hidden />
          <div>
            <h1 className="text-xl font-semibold">Recuperação segura de conta</h1>
            <p className="text-sm text-zinc-600">Fluxo demonstrativo com protocolo, verificação e avaliação de risco.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1.4fr_0.8fr]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Iniciar solicitação</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Identificador da conta
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("accountIdentifier")} />
            </label>
            <label className="grid gap-1 text-sm">
              Fingerprint do dispositivo
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("deviceFingerprint")} />
            </label>
            <label className="grid gap-1 text-sm">
              E-mail anterior
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("previousEmail")} />
            </label>
            <label className="grid gap-1 text-sm">
              Telefone anterior
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("previousPhone")} />
            </label>
            <label className="grid gap-1 text-sm">
              Novo e-mail
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("targetEmail")} />
            </label>
            <label className="grid gap-1 text-sm">
              Novo telefone
              <input className="rounded border border-zinc-300 px-3 py-2" {...form.register("targetPhone")} />
            </label>
          </div>
          <label className="mt-5 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" {...form.register("consentAccepted")} />
            Aceito registrar trilha de auditoria e consentimento para esta recuperação.
          </label>
          {error ? <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          <button
            disabled={submitting}
            className="mt-6 inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Criar protocolo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>

        <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Controles do protótipo</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            A próxima tela permite disparar FaceMatch, liveness, avaliação de risco, submissão e alteração final usando
            providers mockados. Nenhum dado sensível real é enviado para terceiros.
          </p>
        </aside>
      </section>
    </main>
  );
}
