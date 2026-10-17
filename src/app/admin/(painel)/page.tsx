import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Label, PageTitle } from "@/components/admin/page-title";
import { btn, inputClass } from "@/components/ui/button";
import { getSettings, listAllServices, listAppointments, listBlocks, listResources } from "@/lib/data";
import { fillMessage, formatMoney, formatPhone, whatsappLink } from "@/lib/format";
import { addDays, capitalize, formatDateLong, isValidDate, timePart, todayInTz } from "@/lib/time";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { changeStatus, createManualBooking } from "./actions";

const STATUS: Record<AppointmentStatus, { label: string; className: string }> = {
  agendado: { label: "Agendado", className: "bg-primary-soft text-primary" },
  concluido: { label: "Concluído", className: "bg-success-soft text-success" },
  cancelado: { label: "Cancelado", className: "bg-surface-2 text-muted" },
  faltou: { label: "Faltou", className: "bg-warn-soft text-warn" },
};

export default async function AgendaPage({ searchParams }: PageProps<"/admin">) {
  const [{ data }, settings] = await Promise.all([searchParams, getSettings()]);
  const today = todayInTz(settings.timezone);
  const date = typeof data === "string" && isValidDate(data) ? data : today;
  const next = addDays(date, 1);
  const [appointments, blocks, services, resources] = await Promise.all([
    listAppointments(`${date}T00:00`, `${next}T00:00`),
    listBlocks(`${date}T00:00`, `${next}T00:00`),
    listAllServices(),
    listResources(),
  ]);
  const showResource = resources.length > 1;
  const active = appointments.filter((a) => a.status === "agendado" || a.status === "concluido");
  const total = active.reduce((sum, a) => sum + a.preco_centavos, 0);

  return (
    <>
      <PageTitle
        title={capitalize(formatDateLong(date))}
        subtitle={`${active.length} ${active.length === 1 ? "atendimento" : "atendimentos"} · ${formatMoney(total)}`}
      >
        <div className="flex items-center gap-1">
          <Link href={`/admin?data=${addDays(date, -1)}`} className={btn("outline", "sm", "px-2.5")} aria-label="Dia anterior">
            <ChevronLeft className="size-4" />
          </Link>
          {date !== today && (
            <Link href="/admin" className={btn("outline", "sm")}>
              Hoje
            </Link>
          )}
          <Link href={`/admin?data=${next}`} className={btn("outline", "sm", "px-2.5")} aria-label="Próximo dia">
            <ChevronRight className="size-4" />
          </Link>
          <form action="/admin" className="ml-1">
            <input type="date" name="data" defaultValue={date} className={`${inputClass} h-9 py-0`} aria-label="Ir para a data" />
          </form>
        </div>
      </PageTitle>

      {blocks.length > 0 && (
        <ul className="mb-4 space-y-2">
          {blocks.map((b) => (
            <li key={b.id} className="rounded-xl bg-warn-soft px-4 py-2.5 text-sm text-warn">
              Bloqueado{showResource && ` (${b.recurso_id ? resources.find((r) => r.id === b.recurso_id)?.nome : "todos"})`} {b.inicio.slice(0, 10) < date ? "desde antes" : `das ${timePart(b.inicio)}`}{" "}
              {b.fim.slice(0, 10) > date ? "até o fim do dia" : `às ${timePart(b.fim)}`}
              {b.motivo && ` · ${b.motivo}`}
            </li>
          ))}
        </ul>
      )}

      {appointments.length === 0 ? (
        <Card className="text-center text-muted">Nenhum agendamento neste dia.</Card>
      ) : (
        <ul className="space-y-3">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} a={a} reminderTemplate={settings.msg_lembrete} showResource={showResource} />
          ))}
        </ul>
      )}

      <details className="group mt-8 rounded-2xl border border-line bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-semibold">
          <Plus className="size-4 transition group-open:rotate-45" /> Novo agendamento (cliente que marcou por fora)
        </summary>
        <ActionForm action={createManualBooking} className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
          <Label text="Serviço" className="sm:col-span-2">
            <select name="servicoId" required className={inputClass}>
              {services
                .filter((s) => s.ativo)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} · {s.duracao_minutos} min · {formatMoney(s.preco_centavos)}
                  </option>
                ))}
            </select>
          </Label>
          <Label text="Data">
            <input type="date" name="date" required defaultValue={date} className={inputClass} />
          </Label>
          <Label text="Horário">
            <input type="time" name="time" required className={inputClass} />
          </Label>
          <Label text="Nome da cliente">
            <input name="nome" required minLength={2} maxLength={80} className={inputClass} />
          </Label>
          <Label text="WhatsApp">
            <input name="whatsapp" type="tel" required placeholder="(83) 99999-9999" className={inputClass} />
          </Label>
          <Label text="Observação" className="sm:col-span-2">
            <input name="observacao" maxLength={500} className={inputClass} />
          </Label>
          <div className="sm:col-span-2">
            <SubmitButton>Agendar</SubmitButton>
          </div>
        </ActionForm>
      </details>
    </>
  );
}

function AppointmentCard({ a, reminderTemplate, showResource }: { a: Appointment; reminderTemplate: string; showResource: boolean }) {
  const st = STATUS[a.status];
  const reminder = fillMessage(reminderTemplate, {
    nome: a.cliente_nome,
    servico: a.servico_nome,
    data: a.starts_at.slice(0, 10),
    horario: timePart(a.starts_at),
  });
  const faded = a.status === "cancelado" || a.status === "faltou";

  return (
    <li className={`rounded-2xl border border-line bg-surface p-4 ${faded ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4">
          <div className="text-center">
            <p className="font-display text-xl font-semibold">{timePart(a.starts_at)}</p>
            <p className="text-xs text-muted">até {timePart(a.ends_at)}</p>
          </div>
          <div>
            <p className="font-semibold">
              {a.cliente_nome}
              {showResource && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{a.recurso_nome}</span>}
            </p>
            <p className="text-sm text-muted">
              {a.servico_nome} · {formatMoney(a.preco_centavos)}
            </p>
            <p className="text-xs text-muted">
              {formatPhone(a.cliente_whatsapp)} · {a.origem === "site" ? "pelo site" : "pelo painel"}
            </p>
            {a.observacao && <p className="mt-1 text-sm italic text-muted">“{a.observacao}”</p>}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.className}`}>{st.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
        {a.status === "agendado" && (
          <a href={whatsappLink(a.cliente_whatsapp, reminder)} target="_blank" rel="noopener noreferrer" className={btn("whatsapp", "sm")}>
            <MessageCircle className="size-4" /> Lembrete
          </a>
        )}
        {a.status === "agendado" ? (
          <>
            <StatusButton id={a.id} status="concluido" label="Concluído" />
            <StatusButton id={a.id} status="faltou" label="Faltou" />
            <StatusButton id={a.id} status="cancelado" label="Cancelar" confirm="Cancelar este agendamento? O horário volta a ficar livre no site." danger />
          </>
        ) : (
          <StatusButton id={a.id} status="agendado" label="Voltar para agendado" />
        )}
      </div>
    </li>
  );
}

function StatusButton({
  id,
  status,
  label,
  confirm,
  danger,
}: {
  id: string;
  status: AppointmentStatus;
  label: string;
  confirm?: string;
  danger?: boolean;
}) {
  return (
    <ActionForm action={changeStatus} confirm={confirm}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton variant={danger ? "danger" : "outline"} size="sm">
        {label}
      </SubmitButton>
    </ActionForm>
  );
}
