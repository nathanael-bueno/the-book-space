import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, HandHeart, Mail, MapPin, Phone } from 'lucide-react'
import {
  listPublicInstitutions,
  type PublicInstitution,
} from '../services/institutions'
import { useToast } from '../stores/useToast'

function InstitutionCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-line/30 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-lg bg-line/30" />
        <div className="h-5 w-14 rounded-full bg-line/30" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-line/40" />
      <div className="mt-4 space-y-2.5">
        <div className="h-3.5 w-1/2 rounded bg-line/30" />
        <div className="h-3.5 w-2/3 rounded bg-line/30" />
        <div className="h-3.5 w-2/5 rounded bg-line/30" />
      </div>
      <div className="mt-4 border-t border-line/20 pt-4 space-y-1.5">
        <div className="h-3 w-24 rounded bg-line/30" />
        <div className="h-4 w-1/2 rounded bg-line/30" />
      </div>
      <div className="mt-4 h-9 w-full rounded-lg bg-line/30" />
    </div>
  )
}

function InstitutionCard({ institution }: { institution: PublicInstitution }) {
  return (
    <article className="flex flex-col rounded-xl border border-line/30 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Building2 size={20} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ativa
        </span>
      </div>

      <h2 className="mt-4 text-base font-semibold leading-snug text-ink">
        {institution.name}
      </h2>

      <div className="mt-3 space-y-2 text-sm">
        <p className="flex items-start gap-2 font-medium text-ink-dim">
          <MapPin size={14} className="mt-0.5 shrink-0 text-accent" />
          <span>{institution.city}</span>
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Mail size={14} className="shrink-0 text-ink-muted" />
          <span className="break-all">{institution.contact}</span>
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Phone size={14} className="shrink-0 text-ink-muted" />
          {institution.phone}
        </p>
      </div>

      <div className="mt-4 border-t border-line/20 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted/70">
          Recebe agora
        </p>
        <p className="mt-1 text-sm font-medium text-ink">{institution.needs}</p>
      </div>

      <Link
        to={`/app/institutions/${institution.id}/donate`}
        className="btn-primary mt-5 h-9 justify-center text-sm"
      >
        <HandHeart size={15} />
        Doar livros
      </Link>
    </article>
  )
}

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
          message: 'Não foi possível carregar instituições no momento.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadInstitutions()

    return () => {
      active = false
    }
  }, [toast])

  return (
    <main className="mx-auto w-full space-y-5">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Pontos de doação
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
          Encontre organizações que recebem livros e ampliam o acesso à leitura
          na comunidade.
        </p>
      </section>

      {isLoading ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <InstitutionCardSkeleton key={i} />
          ))}
        </section>
      ) : null}

      {!isLoading && !institutions.length ? (
        <section className="flex flex-col items-center gap-2 py-12 text-center">
          <Building2 size={32} className="text-ink-muted/40" />
          <p className="text-sm font-medium text-ink">
            Nenhuma instituição ativa no momento.
          </p>
          <p className="text-sm text-ink-muted">
            Novas organizações serão adicionadas em breve.
          </p>
        </section>
      ) : null}

      {!isLoading && institutions.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {institutions.map((institution) => (
            <InstitutionCard key={institution.id} institution={institution} />
          ))}
        </section>
      ) : null}
    </main>
  )
}
