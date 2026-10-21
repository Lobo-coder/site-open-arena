import Image from "next/image";
import Link from "next/link";
import { AtSign, CalendarCheck, Clock, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { btn } from "@/components/ui/button";
import { describeHours } from "@/lib/availability";
import { getSettings, listBusinessHours, listPublicServices } from "@/lib/data";
import { formatMoney, whatsappLink } from "@/lib/format";
import { WEEKDAYS, formatDuration } from "@/lib/time";

export default async function Home() {
  const [s, services, hours] = await Promise.all([getSettings(), listPublicServices(), listBusinessHours()]);
  // Semana começando na segunda, que é como as pessoas leem horário de funcionamento.
  const week = [...hours.filter((h) => h.dia_semana !== 0), ...hours.filter((h) => h.dia_semana === 0)];

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Brand name={s.nome_negocio} />
          <Link href="/agendar" className={btn("primary", "sm")}>
            Reservar
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-[radial-gradient(ellipse_at_top_right,#0f6fa8_0%,#0a2740_55%,#071a2c_100%)] text-white">
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 pb-16 pt-10 sm:pt-16 md:grid-cols-[1fr_1fr]">
            <div className="max-w-2xl animate-fade-up">
              {s.slogan && <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#5fd6e3]">{s.slogan}</p>}
              <h1 className="text-5xl font-bold uppercase leading-[0.95] sm:text-7xl">{s.hero_titulo}</h1>
              <p className="mt-5 text-lg text-white/75">{s.hero_subtitulo}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/agendar" className={btn("primary", "lg")}>
                  <CalendarCheck className="size-5" /> Reservar horário
                </Link>
                {s.whatsapp && (
                  <a
                    href={whatsappLink(s.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn("outline", "lg", "border-white/30 bg-white/5 text-white hover:border-white hover:text-white")}
                  >
                    <MessageCircle className="size-5" /> Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
            <Image
              src="/logo-escuro.png"
              alt={s.nome_negocio}
              width={1000}
              height={408}
              priority
              className="order-first w-full max-w-sm drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] md:order-none md:max-w-md"
            />
          </div>
        </section>

        <section id="servicos" className="border-y border-line bg-surface py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-4xl font-bold uppercase">Reservas</h2>
            <p className="mt-2 text-muted">Escolha a modalidade e veja na hora os horários livres.</p>
            {services.length === 0 ? (
              <p className="mt-8 rounded-2xl bg-surface-2 p-6 text-muted">Nenhum serviço cadastrado ainda.</p>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((sv) => (
                  <li key={sv.id}>
                    <Link
                      href={`/agendar?servico=${sv.id}`}
                      className="group flex h-full flex-col rounded-2xl border border-line bg-bg p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                    >
                      <h3 className="text-xl font-semibold">{sv.nome}</h3>
                      {sv.descricao && <p className="mt-1.5 text-sm text-muted">{sv.descricao}</p>}
                      <div className="mt-auto flex items-end justify-between pt-5">
                        <div>
                          <p className="text-lg font-bold text-primary">{formatMoney(sv.preco_centavos)}</p>
                          <p className="flex items-center gap-1 text-xs text-muted">
                            <Clock className="size-3.5" /> {formatDuration(sv.duracao_minutos)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary group-hover:underline">Reservar →</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-4xl font-bold uppercase">Como funciona</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Escolha a modalidade", "Campo society ou beach tennis, com preço e duração."],
              ["Escolha dia e horário", "Só aparecem os horários em que a quadra está livre."],
              ["Pronto, é só jogar", "A quadra fica reservada no seu nome. Se quiser, confirme pelo WhatsApp."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-line bg-surface p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {s.sobre && (
          <section className="mx-auto max-w-5xl px-4 pb-16">
            <div className="rounded-3xl bg-primary-soft p-8 sm:p-10">
              <Sparkles className="size-6 text-primary" />
              <p className="mt-3 max-w-2xl text-lg">{s.sobre}</p>
            </div>
          </section>
        )}

        <section id="contato" className="border-t border-line bg-surface py-16">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold uppercase">Horários</h2>
              <dl className="mt-6 divide-y divide-line text-sm">
                {week.map((h) => (
                  <div key={h.dia_semana} className="flex justify-between py-2.5">
                    <dt className="font-medium">{WEEKDAYS[h.dia_semana]}</dt>
                    <dd className={h.atende ? "" : "text-muted"}>{describeHours(h)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h2 className="text-4xl font-bold uppercase">Onde estamos</h2>
              <ul className="mt-6 space-y-4 text-sm">
                {s.endereco && (
                  <li className="flex gap-3">
                    <MapPin className="size-5 shrink-0 text-primary" />
                    {s.mapa_url ? (
                      <a href={s.mapa_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {s.endereco}
                      </a>
                    ) : (
                      s.endereco
                    )}
                  </li>
                )}
                {s.whatsapp && (
                  <li className="flex gap-3">
                    <MessageCircle className="size-5 shrink-0 text-primary" />
                    <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      WhatsApp
                    </a>
                  </li>
                )}
                {s.instagram && (
                  <li className="flex gap-3">
                    <AtSign className="size-5 shrink-0 text-primary" />
                    <a
                      href={`https://instagram.com/${s.instagram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      @{s.instagram.replace(/^@/, "")}
                    </a>
                  </li>
                )}
              </ul>
              <Link href="/agendar" className={btn("primary", "lg", "mt-8")}>
                <CalendarCheck className="size-5" /> Reservar minha quadra
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} {s.nome_negocio} ·{" "}
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>{" "}
        ·{" "}
        <Link href="/admin" className="hover:underline">
          Área do profissional
        </Link>
      </footer>
    </>
  );
}
