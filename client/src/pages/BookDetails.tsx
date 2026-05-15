import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  MapPin,
  Repeat2,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react'
import { getCurrentUserId } from '../services/auth'
import { deleteBook, getBook, type ApiBook } from '../services/books'
import { ApiError } from '../services/http'
import { useToast } from '../stores/useToast'

const statusLabel: Record<string, { label: string; className: string }> = {
  disponivel: {
    label: 'Disponível',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  em_negociacao: {
    label: 'Em negociação',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  trocado: {
    label: 'Trocado',
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
}

export default function BookDetails() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [book, setBook] = useState<ApiBook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const isOwner = Boolean(
    book && currentUserId && book.id_usuario_dono === currentUserId
  )

  useEffect(() => {
    if (!bookId) return
    const safeBookId = bookId
    let active = true

    async function loadBook() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getBook(safeBookId)
        if (!active) return
        setBook(response.data)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar o livro.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadBook()
    return () => {
      active = false
    }
  }, [bookId])

  async function handleDelete() {
    if (!bookId) return
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este livro?'
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await deleteBook(bookId)
      toast.success({ title: 'Livro removido', message: response.message })
      navigate('/app/catalog')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel excluir o livro.'
      toast.error({ title: 'Erro ao excluir', message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!bookId) {
    return (
      <main className="mx-auto w-full">
        <p className="text-sm text-ink-dim">Livro invalido.</p>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full space-y-4">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-line/40" />
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-line/40" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-line/40" />
            <div className="h-4 w-1/3 animate-pulse rounded-lg bg-line/30" />
            <div className="h-24 animate-pulse rounded-xl bg-line/30" />
          </div>
        </div>
      </main>
    )
  }

  if (!book || error) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-5">
          <BookOpen size={36} className="text-brand-deep/60" />
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Livro nao encontrado
          </h1>
          <p className="mt-2 text-sm text-ink-dim">
            {error ?? 'O livro que voce tentou abrir nao esta disponivel.'}
          </p>
          <Link
            to="/app/catalog"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar ao catalogo
          </Link>
        </section>
      </main>
    )
  }

  const photos = book.fotos?.filter(Boolean) ?? []
  const cover = photos[activePhoto] ?? photos[0] ?? ''
  const status = statusLabel[book.status] ?? {
    label: book.status,
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  }
  const canPropose = !isOwner && book.status === 'disponivel'

  return (
    <main className="mx-auto w-full space-y-4">
      <section>
        <div className="flex items-center gap-3">
          <Link
            to="/app/catalog"
            className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Detalhes do livro</h1>
            <p className="mt-1 text-sm leading-5 text-ink-dim">
              Veja informacoes completas, status e dados do dono.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Coluna da imagem */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line/35 bg-[#fbfaf7] shadow-sm">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img
                src={cover}
                alt={`Capa do livro ${book.titulo}`}
                className="h-full w-full object-cover transition-all duration-300"
              />
            </div>
          </div>

          {photos.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActivePhoto(index)}
                  className={[
                    'h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    index === activePhoto
                      ? 'border-accent shadow-sm'
                      : 'border-line/35 opacity-60 hover:opacity-100',
                  ].join(' ')}
                >
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Coluna das informações */}
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
              {book.genre ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/8 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  <Tag size={10} />
                  {book.genre.nome}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-ink">
              {book.titulo}
            </h1>
            <p className="mt-1 text-base text-ink-muted">{book.autor}</p>

            {book.isbn ? (
              <p className="mt-1 text-xs text-ink-ghost">ISBN: {book.isbn}</p>
            ) : null}
          </div>

          {/* Metadata cards */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Conservacao
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">
                {book.estado_conservacao}
              </p>
            </div>
            <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Localização
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                <MapPin size={13} className="text-accent" />
                {book.cidade ?? 'Nao informado'}
              </p>
            </div>
            <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Dono
              </p>
              <Link
                to={`/app/users/${book.owner?.id ?? ''}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-accent"
              >
                {book.owner?.foto ? (
                  <img
                    src={book.owner.foto}
                    alt={book.owner.nome_completo}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <UserRound size={13} className="text-accent" />
                )}
                {book.owner?.nome_completo ?? 'Usuario'}
              </Link>
            </div>
          </div>

          {/* Descrição */}
          <div className="rounded-xl border border-line/35 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              <BookOpen size={14} />
              Sobre o livro
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-dim">
              {book.descricao ?? 'Nenhuma descricao informada pelo dono.'}
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-1">
            {canPropose ? (
              <Link
                to={`/app/books/${book.id}/trade`}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-sm shadow-accent/20 transition-colors hover:bg-brand-deep"
              >
                <Repeat2 size={17} />
                Propor troca
              </Link>
            ) : null}

            {isOwner ? (
              <>
                <Link
                  to={`/app/books/${book.id}/edit`}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  <Edit3 size={16} />
                  Editar livro
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-danger/30 bg-white px-4 text-sm font-semibold text-danger shadow-sm transition-colors hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Excluindo...' : 'Excluir livro'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
