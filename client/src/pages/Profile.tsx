import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookImage,
  BookPlus,
  MapPin,
  Pencil,
  Repeat2,
  Star,
  UserRound,
} from 'lucide-react'
import { ApiError } from '../services/http'
import { getMyProfile, type Profile as ProfileData } from '../services/profile'
import { listUserReviews, type ApiReview } from '../services/reviews'
import { getMyBooks, type ApiBook } from '../services/books'
import { listMyTrades } from '../services/trades'
import { useToast } from '../stores/useToast'

type ProfilePageState = {
  data: ProfileData | null
  loading: boolean
  error: string | null
}

type ReviewsPageState = {
  data: ApiReview[]
  loading: boolean
  error: string | null
}

type SummaryPageState = {
  books: ApiBook[]
  completedTrades: number
  donations: number
}

function getBookStatusPresentation(status?: string) {
  const normalized = (status ?? '').trim().toLowerCase()
  if (normalized === 'disponivel') {
    return {
      label: 'Disponivel',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }
  if (normalized === 'reservado') {
    return {
      label: 'Reservado',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }
  if (normalized === 'doado') {
    return {
      label: 'Doado',
      className: 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep',
    }
  }

  return {
    label: status || 'Sem status',
    className: 'border-line/40 bg-white text-ink-muted',
  }
}

export default function Profile() {
  const toast = useToast()
  const [profileState, setProfileState] = useState<ProfilePageState>({
    data: null,
    loading: true,
    error: null,
  })
  const [reviewsState, setReviewsState] = useState<ReviewsPageState>({
    data: [],
    loading: false,
    error: null,
  })
  const [summaryState, setSummaryState] = useState<SummaryPageState>({
    books: [],
    completedTrades: 0,
    donations: 0,
  })

  const profile = profileState.data
  const isLoading = profileState.loading
  const reviews = reviewsState.data
  const isLoadingReviews = reviewsState.loading
  const myBooks = summaryState.books
  const completedTradesCount = summaryState.completedTrades
  const donationsCount = summaryState.donations

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setProfileState((s) => ({ ...s, loading: true, error: null }))
      try {
        const response = await getMyProfile()
        if (!active) return
        setProfileState({ data: response.data, loading: false, error: null })
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar seu perfil.'
        setProfileState((s) => ({ ...s, loading: false, error: message }))
        toast.error({ title: 'Erro', message })
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    const profileId = profile.id

    let active = true

    async function loadReviews() {
      setReviewsState((s) => ({ ...s, loading: true, error: null }))
      try {
        const response = await listUserReviews(profileId)
        if (!active) return
        setReviewsState({ data: response.data, loading: false, error: null })
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar as avaliacoes recebidas.'
        setReviewsState((s) => ({ ...s, loading: false, error: message }))
        toast.error({ title: 'Erro', message })
      }
    }

    loadReviews()
    return () => {
      active = false
    }
  }, [profile?.id])

  useEffect(() => {
    let active = true

    async function loadSummaryData() {
      try {
        const [booksResponse, tradesResponse] = await Promise.all([
          getMyBooks(),
          listMyTrades(100),
        ])
        if (!active) return

        const books = booksResponse.data
        setSummaryState({
          books,
          donations: books.filter(
            (book) => book.status?.toLowerCase().trim() === 'doado'
          ).length,
          completedTrades: tradesResponse.data.filter(
            (trade) => trade.status === 'concluida'
          ).length,
        })
      } catch {
        if (!active) return
        setSummaryState({ books: [], completedTrades: 0, donations: 0 })
      }
    }

    loadSummaryData()
    return () => {
      active = false
    }
  }, [])

  const memberSince = (() => {
    if (!profile?.created_at) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(profile.created_at))
  })()

  const ratingLabel = (() => {
    const value = profile?.nota
    if (value === null || value === undefined || value === '') return null
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return null
    return numeric.toFixed(1)
  })()

  if (isLoading) {
    return (
      <main className="mx-auto w-full space-y-3">
        <div className="rounded-xl border border-line/45 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-2xl bg-line/40" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-40 rounded bg-line/40" />
              <div className="h-3 w-24 rounded bg-line/30" />
              <div className="h-3 w-56 rounded bg-line/30" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full space-y-5">
      <section className="space-y-1">
        <Link
          to="/app/feed"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
        >
          <span className="text-base leading-none">‹</span>
          Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Meu perfil</h1>
      </section>

      {/* Hero */}
      <section className="rounded-xl border border-line/35 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-line/30 bg-[#f5f3ee] text-accent">
              {profile?.foto ? (
                <img
                  src={profile.foto}
                  alt={profile.nome_completo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound size={34} />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <h1 className="text-xl font-semibold text-ink">
                {profile?.nome_completo ?? '-'}
              </h1>

              {profile?.cidade && (
                <p className="flex items-center gap-1 text-sm text-ink-dim">
                  <MapPin size={13} />
                  {profile.cidade}
                  {profile.estado ? `, ${profile.estado}` : ''}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {ratingLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    {ratingLabel}
                  </span>
                )}
                <span className="text-xs text-ink-muted">
                  Membro desde {memberSince}
                </span>
              </div>

              {profile?.bio && (
                <p className="pt-1 text-sm leading-6 text-ink-dim">
                  {profile.bio}
                </p>
              )}
              {!profile?.bio && (
                <p className="pt-1 text-sm leading-6 text-ink-dim">
                  Adicione uma bio para apresentar melhor seu perfil.
                </p>
              )}
            </div>
          </div>

          <Link
            to="/app/profile/edit"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Pencil size={14} />
            Editar perfil
          </Link>
        </div>
      </section>

      {profileState.error && (
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {profileState.error}
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-3 gap-2">
        <article className="rounded-xl border border-line/30 bg-white p-3 sm:p-4">
          <p className="text-3xl font-bold leading-none text-ink">
            {myBooks.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Livros
          </p>
        </article>
        <article className="rounded-xl border border-line/30 bg-white p-3 sm:p-4">
          <p className="text-3xl font-bold leading-none text-ink">
            {completedTradesCount}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Trocas
          </p>
        </article>
        <article className="rounded-xl border border-line/30 bg-white p-3 sm:p-4">
          <p className="text-3xl font-bold leading-none text-ink">
            {donationsCount}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Doacoes
          </p>
        </article>
      </section>

      {/* Main content */}
      <div className="grid gap-3 xl:grid-cols-[1fr_270px]">
        {/* Livros */}
        <section className="rounded-xl border border-line/30 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Meus livros</h2>
            <Link
              to="/app/books/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line/45 px-2.5 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <BookPlus size={13} />
              Cadastrar
            </Link>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {myBooks.map((book) => (
              <article
                key={book.id}
                className="flex gap-3 rounded-lg border border-line/25 bg-[#fbfaf7] p-3"
              >
                <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md border border-line/35 bg-white">
                  {book.fotos?.[0] ? (
                    <img
                      src={book.fotos[0]}
                      alt={book.titulo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-muted">
                      <BookImage size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {book.titulo}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {book.autor}
                  </p>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold normal-case ${getBookStatusPresentation(book.status).className}`}
                    >
                      {getBookStatusPresentation(book.status).label}
                    </span>
                  </p>
                  <Link
                    to={`/app/books/${book.id}/edit`}
                    className="mt-2 inline-flex rounded-md border border-line/35 px-2 py-1 text-xs font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {!myBooks.length && (
            <p className="ui-empty-state py-8 text-center text-sm text-ink-muted">
              Voce ainda nao cadastrou livros.
            </p>
          )}
        </section>

        {/* Sidebar */}
        <div className="space-y-2.5">
          {/* Acessos rapidos */}
          <section className="rounded-xl border border-line/30 bg-white p-3 sm:p-4">
            <h2 className="text-base font-semibold text-ink">Atalhos</h2>
            <nav className="mt-3 space-y-1.5">
              <Link
                to="/app/trades"
                className="flex items-center gap-2.5 rounded-lg border border-line/45 px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
              >
                <Repeat2 size={15} />
                Historico de trocas
              </Link>
            </nav>
          </section>

          {/* Avaliacoes */}
          <section className="rounded-xl border border-line/30 bg-white p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Avaliacoes</h2>
              {ratingLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {ratingLabel}
                </span>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {isLoadingReviews && (
                <p className="text-sm text-ink-dim">Carregando...</p>
              )}
              {reviewsState.error && (
                <p className="text-sm font-medium text-brand-deep">
                  {reviewsState.error}
                </p>
              )}
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-line/35 bg-[#fbfaf7] p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">
                      {review.reviewer?.nome_completo ?? 'Usuario'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star
                        size={11}
                        className="fill-amber-400 text-amber-400"
                      />
                      {Number(review.nota).toFixed(1)}
                    </span>
                  </div>
                  {review.comentario && (
                    <p className="mt-1.5 text-xs leading-5 text-ink-dim">
                      {review.comentario}
                    </p>
                  )}
                </article>
              ))}
              {!isLoadingReviews && !reviews.length && (
                <p className="py-4 text-center text-sm text-ink-muted">
                  Nenhuma avaliacao ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
