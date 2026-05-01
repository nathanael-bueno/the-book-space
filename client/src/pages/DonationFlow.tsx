import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2, HandHeart } from 'lucide-react'
import { books } from '../data/books'
import { useToast } from '../stores/useToast'

const institutions = [
  {
    id: 'inst-1',
    name: 'Biblioteca Comunitaria Aurora',
    city: 'Belo Horizonte, MG',
  },
  {
    id: 'inst-2',
    name: 'Instituto Paginas Abertas',
    city: 'Sao Paulo, SP',
  },
  {
    id: 'inst-3',
    name: 'Casa de Leitura Mar do Norte',
    city: 'Recife, PE',
  },
]

export default function DonationFlow() {
  const toast = useToast()
  const { institutionId } = useParams()
  const institution = institutions.find((item) => item.id === institutionId)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success({
      title: 'Solicitacao de doacao enviada',
      message: 'Fluxo mock concluido. Integrar com API para persistir.',
    })
  }

  if (!institution) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-line/45 bg-white p-6 text-center shadow-sm">
        <Building2 size={36} className="text-brand-deep" />
        <h1 className="mt-4 text-xl font-semibold text-ink">
          Instituicao nao encontrada
        </h1>
        <Link
          to="/institutions"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5">
      <Link
        to="/institutions"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <HandHeart size={15} />
            Doacao de livro
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Enviar livro para {institution.name}
          </h1>
          <p className="mt-2 text-sm text-ink-dim">{institution.city}</p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[1fr_0.75fr]"
      >
        <section className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">
              Livro para doar
            </span>
            <select className="mt-2 h-11 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent">
              {books.slice(0, 4).map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.author}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">Observacoes</span>
            <textarea
              rows={5}
              placeholder="Informe estado do livro, disponibilidade e melhor forma de contato."
              className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <CheckCircle2 size={17} />
            Confirmar doacao
          </button>
        </section>

        <aside className="rounded-xl border border-line/35 bg-[#fbfaf7] p-4">
          <Building2 size={24} className="text-brand-deep" />
          <h2 className="mt-3 text-base font-semibold text-ink">
            Proximo passo
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-dim">
            A instituicao recebe sua solicitacao e combina diretamente a
            entrega. A plataforma registra o historico da doacao.
          </p>
        </aside>
      </form>
    </main>
  )
}
