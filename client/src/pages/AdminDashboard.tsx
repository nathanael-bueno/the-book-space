import {
  AlertTriangle,
  ArrowUpRight,
  BookHeart,
  RefreshCcw,
  Repeat2,
  ShieldCheck,
  Users,
} from 'lucide-react'

const metrics = [
  {
    label: 'Usuarios ativos',
    value: '1.284',
    delta: '+8.4%',
    detail: 'nos ultimos 30 dias',
    icon: Users,
  },
  {
    label: 'Trocas concluidas',
    value: '342',
    delta: '+12.1%',
    detail: 'neste mes',
    icon: Repeat2,
  },
  {
    label: 'Doacoes realizadas',
    value: '97',
    delta: '+5.7%',
    detail: 'confirmadas em instituicoes',
    icon: BookHeart,
  },
  {
    label: 'Denuncias pendentes',
    value: '14',
    delta: '-2.0%',
    detail: 'aguardando moderacao',
    icon: AlertTriangle,
  },
]

const recentEvents = [
  {
    title: 'Novo pico de trocas',
    description: 'Regiao Centro registrou 29 trocas em 24h.',
    when: 'ha 2h',
  },
  {
    title: 'Instituicao aprovada',
    description: 'Biblioteca Comunitaria Aurora entrou na rede.',
    when: 'ha 5h',
  },
  {
    title: 'Fila de denuncias reduzida',
    description: 'Equipe moderou 12 novos relatos com sucesso.',
    when: 'ontem',
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <ShieldCheck size={14} />
              Painel administrativo
            </p>
            <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
              Visao geral da plataforma
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Acompanhe saude da comunidade e principais indicadores.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-3 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <RefreshCcw size={16} />
            Atualizar
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const positive = metric.delta.startsWith('+')

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/15 bg-[#fbfaf7] text-brand-deep">
                  <Icon size={18} />
                </div>
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold ${
                    positive
                      ? 'border-accent/25 bg-[#fbfaf7] text-accent'
                      : 'border-line/40 bg-white text-ink-dim'
                  }`}
                >
                  {metric.delta}
                </span>
              </div>
              <p className="mt-4 text-sm text-ink-muted">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{metric.detail}</p>
            </article>
          )
        })}
      </section>

      <section className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Atividade recente
          </h2>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            Relatorio completo
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {recentEvents.map((event) => (
            <article
              key={event.title}
              className="rounded-xl border border-line/35 bg-[#fbfaf7] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">
                  {event.title}
                </h3>
                <span className="text-xs font-medium text-brand-deep">
                  {event.when}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
