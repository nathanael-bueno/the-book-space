import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'
import { getMyBooks } from '../services/books'
import {
  getDonationInstitutionById,
  submitDonation,
  type DonationInstitution,
} from '../services/donations'
import { useToast } from '../stores/useToast'

type DonationBook = {
  id: string
  titulo: string
  autor: string
}

export default function DonationFlow() {
  const toast = useToast()
  const { institutionId } = useParams()
  const [institution, setInstitution] = useState<DonationInstitution | null>(
    null
  )
  const [books, setBooks] = useState<DonationBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadData() {
      if (!institutionId) {
        setError('Instituicao invalida.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const [institutionData, myBooks] = await Promise.all([
          getDonationInstitutionById(institutionId),
          getMyBooks().catch(() => ({ message: '', data: [] })),
        ])

        if (!active) return

        setInstitution(institutionData)
        const normalizedBooks = myBooks.data.map((book) => ({
          id: book.id,
          titulo: book.titulo,
          autor: book.autor,
        }))
        setBooks(normalizedBooks)

        if (normalizedBooks.length) {
          setSelectedBookId(normalizedBooks[0].id)
        }
      } catch {
        if (!active) return
        setError('Nao foi possivel carregar dados para a doacao.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [institutionId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!institutionId || !selectedBookId) return

    setIsSubmitting(true)
    try {
      const result = await submitDonation({
        institutionId,
        bookId: selectedBookId,
        notes: notes.trim(),
      })

      if (result.persisted) {
        toast.success({
          title: 'Doacao enviada',
          message: 'A instituicao recebeu sua solicitacao com sucesso.',
        })
      } else {
        toast.success({
          title: 'Doacao registrada localmente',
          message:
            'API indisponivel no momento. Solicitacao salva nesta sessao.',
        })
      }

      setNotes('')
    } catch {
      toast.error({
        title: 'Erro ao confirmar doacao',
        message: 'Tente novamente em instantes.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full space-y-3">
        <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando fluxo de doacao...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto w-full space-y-3">
        <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {error}
        </p>
      </main>
    )
  }

  if (!institution) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          <Building2 size={36} className="text-brand-deep" />
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Instituicao nao encontrada
          </h1>
          <Link
            to="/app/institutions"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app/institutions"
              className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
            <div>
            <h1 className="text-2xl font-semibold text-ink">
              Enviar livro para {institution.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              {institution.city}
            </p>
            </div>
          </div>
        </div>
      </section>

      {!books.length ? (
        <section className="flex flex-col items-center gap-2 py-8 text-center text-ink-dim">
          <CheckCircle2 size={22} className="text-brand-deep" />
          <p className="text-sm font-medium text-ink">
            Voce ainda nao tem livros disponiveis para doacao.
          </p>
          <p className="text-sm">Cadastre um livro para continuar.</p>
          <Link
            to="/app/books/new"
            className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            Cadastrar livro
          </Link>
        </section>
      ) : null}

      {books.length ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-2.5 rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5 lg:grid-cols-[1fr_0.75fr]"
        >
          <section className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Livro para doar
              </span>
              <select
                value={selectedBookId}
                onChange={(event) => setSelectedBookId(event.target.value)}
                disabled={!books.length}
                className="mt-2 h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-70"
              >
                {!books.length ? (
                  <option value="">Nenhum livro disponivel para doacao</option>
                ) : null}
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.titulo} - {book.autor}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Observacoes
              </span>
              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Informe estado do livro, disponibilidade e melhor forma de contato."
                className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
              />
            </label>

            <button
              type="submit"
              disabled={!books.length || !selectedBookId || isSubmitting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={17} />
              {isSubmitting ? 'Enviando...' : 'Confirmar doacao'}
            </button>
          </section>

          <aside className="rounded-xl border border-line/35 bg-[#fbfaf7] p-3 sm:p-3.5">
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
      ) : null}
    </main>
  )
}
