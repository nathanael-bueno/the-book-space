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
    <main className="mx-auto w-full space-y-3">
      <section className="">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              Pontos de doacao
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              Encontre organizacoes que recebem livros e ajudam a ampliar o
              acesso a leitura.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando instituicoes...
        </section>
      ) : null}

      {!isLoading && !institutions.length ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Nenhuma instituicao ativa disponivel no momento.
        </section>
      ) : null}

      {!isLoading && institutions.length ? (
        <section className="grid gap-2.5 lg:grid-cols-3">
          {institutions.map((institution) => (
            <article
              key={institution.id}
              className="flex flex-col rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/15 bg-[#fbfaf7] text-brand-deep">
                <Building2 size={23} />
              </div>
              <h2 className="mt-4 text-lg font-semibold leading-tight text-ink">
                {institution.name}
              </h2>

              <div className="mt-4 space-y-3 text-sm text-ink-dim">
                <p className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-brand-deep"
                  />
                  <span>{institution.city}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={16} className="shrink-0 text-brand-deep" />
                  <span className="break-all">{institution.contact}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-brand-deep" />
                  {institution.phone}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Recebe agora
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {institution.needs}
                </p>
              </div>

              <Link
                to={`/app/institutions/${institution.id}/donate`}
                className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
              >
                <HandHeart size={17} />
                Doar livros
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  )
}
