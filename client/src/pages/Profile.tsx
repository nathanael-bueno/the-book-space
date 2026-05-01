import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, MapPin } from 'lucide-react'

export default function Profile() {
  return (
    <main className="min-h-screen w-full bg-[#f8f5ef] p-4 text-ink sm:p-5 md:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/15 bg-canvas/55 text-accent shadow-sm">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-ink">
                    Marcos Macedo
                  </h1>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
                    <MapPin size={14} />
                    Belo Horizonte, MG
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-ink-dim">
                    Leitor de classicos brasileiros, tecnologia e ficcao
                    cientifica.
                  </p>
                </div>
              </div>

              <Link
                to="/profile/edit"
                className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
              >
                Editar perfil
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
              Informacoes pessoais
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Nome completo
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  Marcos Macedo
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  E-mail
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  marcos@email.com
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Telefone
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  (31) 99999-0000
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Cidade
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  Belo Horizonte, MG
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
              Conta
            </h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Plano
                </p>
                <p className="mt-1 text-sm font-medium text-ink">Comunidade</p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Membro desde
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  Abril de 2026
                </p>
              </div>
              <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Status do perfil
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-deep">
                  Ativo
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
