import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, HandHeart, Mail, MapPin, Phone } from 'lucide-react'
import {
  listPublicInstitutions,
  type PublicInstitution,
} from '../services/institutions'
import { useToast } from '../stores/useToast'

export default function Institutions() {
  const toast = useToast()
  const [institutions, setInstitutions] = useState<PublicInstitution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadInstitutions() {
      setIsLoading(true)

      try {
        const response = await listPublicInstitutions()
        if (!active) return
        setInstitutions(response.data)
      } catch {
        if (!active) return
        toast.error({
          title: 'Erro',
          message: 'Nao foi possivel carregar instituicoes no momento.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadInstitutions()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="mx-auto w-full space-y-4">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Pontos de doacao
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
          Encontre organizacoes que recebem livros e ampliam o acesso a leitura
          na comunidade.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-lg border border-line/30 bg-white px-4 py-3 text-sm text-ink-dim">
          Carregando instituicoes...
        </section>
      ) : null}

      {!isLoading && !institutions.length ? (
        <section className="rounded-lg border border-line/30 bg-white px-4 py-3 text-sm text-ink-dim">
          Nenhuma instituicao ativa disponivel no momento.
        </section>
      ) : null}

      {!isLoading && institutions.length ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {institutions.map((institution) => (
            <article
              key={institution.id}
              className="flex flex-col rounded-lg border border-line/30 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line/30 bg-[#fbfaf7] text-brand-deep">
                  <Building2 size={18} />
                </div>
                <span className="inline-flex rounded-md border border-line/30 bg-[#fbfaf7] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  Ativa
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-tight text-ink">
                {institution.name}
              </h2>

              <div className="mt-3 space-y-2.5 text-sm text-ink-dim">
                <p className="flex items-start gap-2">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-brand-deep"
                  />
                  <span>{institution.city}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={15} className="shrink-0 text-brand-deep" />
                  <span className="break-all">{institution.contact}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0 text-brand-deep" />
                  {institution.phone}
                </p>
              </div>

              <div className="mt-3 rounded-md border border-line/30 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  Recebe agora
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {institution.needs}
                </p>
              </div>

              <Link
                to={`/app/institutions/${institution.id}/donate`}
                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line/35 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-accent/35 hover:text-brand-deep"
              >
                <HandHeart size={16} />
                Doar livros
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  )
}
