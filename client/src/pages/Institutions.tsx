import { Link } from 'react-router-dom'
import { Building2, HandHeart, Mail, MapPin, Phone } from 'lucide-react'

const activeInstitutions = [
  {
    id: 'inst-1',
    name: 'Biblioteca Comunitaria Aurora',
    address: 'Rua das Acacias, 120',
    city: 'Belo Horizonte, MG',
    contact: 'contato@auroraleitora.org',
    phone: '(31) 3333-1200',
    needs: 'Literatura infantil e livros paradidaticos',
  },
  {
    id: 'inst-2',
    name: 'Instituto Paginas Abertas',
    address: 'Av. Paulista, 900',
    city: 'Sao Paulo, SP',
    contact: 'doacoes@paginasabertas.org',
    phone: '(11) 4002-2200',
    needs: 'Romances nacionais e livros de vestibular',
  },
  {
    id: 'inst-3',
    name: 'Casa de Leitura Mar do Norte',
    address: 'Rua do Farol, 45',
    city: 'Recife, PE',
    contact: 'leitura@mardonorte.org',
    phone: '(81) 3222-4500',
    needs: 'Ficcao, poesia e livros em bom estado',
  },
]

export default function Institutions() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <Building2 size={15} />
            Instituicoes ativas
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Pontos de doacao
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">
            Encontre organizacoes que recebem livros e ajudam a ampliar o acesso
            a leitura.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {activeInstitutions.map((institution) => (
          <article
            key={institution.id}
            className="flex flex-col rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/15 bg-[#fbfaf7] text-brand-deep">
              <Building2 size={23} />
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-tight text-ink">
              {institution.name}
            </h2>

            <div className="mt-4 space-y-3 text-sm text-ink-dim">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-deep" />
                <span>
                  {institution.address}
                  <br />
                  {institution.city}
                </span>
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
              to={`/institutions/${institution.id}/donate`}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
            >
              <HandHeart size={17} />
              Doar livros
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
