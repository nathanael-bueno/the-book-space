import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookImage, MapPin, MessageSquare, Repeat2, Star } from 'lucide-react'
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
        setProfileState((s) => ({ ...s, loading: false, error: null }))
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
        setReviewsState((s) => ({ ...s, loading: false, error: null }))
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
    if (value === null || value === undefined || value === '') return '-'
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return String(value)
    return numeric.toFixed(1)
  })()

  return (
    <main className="mx-auto w-full space-y-3">
      <Link
        to="/app/feed"
        className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="rounded-xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-ink">
              {profile?.nome_completo ?? '-'}
            </h1>
            <p className="text-sm text-ink-dim">
              {profile?.cidade ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {profile.cidade}
                </span>
              ) : (
                'Cidade nao informada'
              )}
            </p>
            <p className="max-w-3xl text-sm leading-6 text-ink-dim">
              {profile?.bio ?? 'Sem biografia cadastrada.'}
            </p>
          </div>
          <Link
            to="/app/profile/edit"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            Editar perfil
          </Link>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-ink-dim">Carregando perfil...</p>
      ) : null}

      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Livros cadastrados
          </p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {myBooks.length}
          </p>
        </article>
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Trocas concluidas
          </p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {completedTradesCount}
          </p>
        </article>
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Doacoes realizadas
          </p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {donationsCount}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-2.5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <h2 className="text-base font-semibold text-ink">Meus dados</h2>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Nome completo
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {profile?.nome_completo ?? '-'}
              </p>
            </div>
            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                E-mail
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {profile?.email ?? '-'}
              </p>
            </div>
            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Cidade
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {profile?.cidade ?? 'Nao informado'}
              </p>
            </div>
            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Reputacao
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{ratingLabel}</p>
            </div>
            <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Membro desde
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{memberSince}</p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <h2 className="text-base font-semibold text-ink">Acessos rapidos</h2>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              to="/app/trades"
              className="inline-flex items-center gap-2 rounded-lg border border-line/45 px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <Repeat2 size={15} />
              Ver historico de trocas
            </Link>
            <Link
              to="/app/donations"
              className="inline-flex items-center gap-2 rounded-lg border border-line/45 px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <Star size={15} />
              Ver historico de doacoes
            </Link>
            <Link
              to="/app/books/new"
              className="inline-flex items-center gap-2 rounded-lg border border-line/45 px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              Cadastrar livro
            </Link>
            <Link
              to="/app/profile/notifications"
              className="inline-flex items-center gap-2 rounded-lg border border-line/45 px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <MessageSquare size={15} />
              Preferencias de notificacao
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <h2 className="text-base font-semibold text-ink">Meus livros</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {myBooks.map((book) => (
            <article
              key={book.id}
              className="flex gap-3 rounded-lg border border-line/35 bg-[#fbfaf7] p-3"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md border border-line/35 bg-white">
                {book.fotos?.[0] ? (
                  <img
                    src={book.fotos[0]}
                    alt={book.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-muted">
                    <BookImage size={20} />
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
                <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-brand-deep">
                  {book.status}
                </p>
                <Link
                  to={`/app/books/${book.id}/edit`}
                  className="mt-2 inline-flex rounded-md border border-line/45 px-2.5 py-1 text-xs font-medium text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  Editar livro
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!myBooks.length ? (
          <p className="col-span-full py-6 text-center text-sm text-ink-muted">
            Voce ainda nao cadastrou livros.
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <h2 className="text-base font-semibold text-ink">
          Avaliacoes recebidas
        </h2>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2 text-sm font-medium text-ink">
          <Star size={15} className="text-brand-deep" />
          Media atual: {ratingLabel}
        </div>
        <div className="mt-4 space-y-3">
          {isLoadingReviews ? (
            <p className="text-sm text-ink-dim">Carregando avaliacoes...</p>
          ) : null}
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-lg border border-line/35 bg-[#fbfaf7] p-3"
            >
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <MessageSquare size={15} className="text-brand-deep" />
                {review.reviewer?.nome_completo ?? 'Usuario'} ·{' '}
                {Number(review.nota).toFixed(1)}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-dim">
                {review.comentario ?? 'Sem comentario.'}
              </p>
            </article>
          ))}
          {!isLoadingReviews && !reviews.length ? (
            <p className="py-4 text-center text-sm text-ink-muted">
              Voce ainda nao recebeu avaliacoes.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
