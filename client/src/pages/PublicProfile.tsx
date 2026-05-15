import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageSquare, Star } from 'lucide-react'
import { ApiError } from '../services/http'
import {
  getPublicProfile,
  type Profile as ProfileData,
} from '../services/profile'
import { listUserReviews, type ApiReview } from '../services/reviews'

export default function PublicProfile() {
  const { userId } = useParams()
  const hasInvalidUserId = !userId
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const currentUserId = userId

    let active = true
    async function loadPublicProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getPublicProfile(currentUserId)
        if (!active) return
        setProfile(response.data)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar o perfil publico.'
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadPublicProfile()
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const currentUserId = userId
    let active = true

    async function loadReviews() {
      setIsLoadingReviews(true)
      setReviewsError(null)
      try {
        const response = await listUserReviews(currentUserId)
        if (!active) return
        setReviews(response.data)
      } catch (err) {
        if (!active) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar as avaliacoes.'
        setReviewsError(message)
      } finally {
        if (active) setIsLoadingReviews(false)
      }
    }

    loadReviews()
    return () => {
      active = false
    }
  }, [userId])

  if (hasInvalidUserId) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          Usuario invalido.
        </section>
      </main>
    )
  }

  const userBooks = (profile?.books ?? []).slice(0, 3)
  const totalReviews = reviews.length
  const averageRating = (() => {
    if (!totalReviews) return '0.0'
    const average =
      reviews.reduce((acc, review) => acc + Number(review.nota || 0), 0) /
      totalReviews
    return average.toFixed(1)
  })()

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/app/feed"
            className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink">
              {profile?.nome_completo ?? 'Usuario'}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
              {profile?.cidade ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {profile.cidade}
                </span>
              ) : null}
              {profile?.bio ? (
                <span>
                  {profile?.cidade ? ' · ' : ''}
                  {profile.bio}
                </span>
              ) : (
                <span>
                  {profile?.cidade ? ' · ' : ''}Este usuario ainda nao preencheu
                  uma biografia publica.
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
            <Star size={16} fill="currentColor" />
            {averageRating}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {totalReviews} avaliacoes
          </p>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
          Carregando perfil...
        </section>
      ) : null}
      {error ? (
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          {error}
        </section>
      ) : null}

      <section className="grid gap-2.5 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Livros publicados
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {userBooks.map((book) => (
              <Link
                key={book.id}
                to={`/app/books/${book.id}`}
                className="overflow-hidden rounded-xl border border-line/45 bg-[#fbfaf7] shadow-sm transition-colors hover:border-accent/35"
              >
                <div className="aspect-[3/4] bg-canvas/35">
                  {book.fotos?.[0] ? (
                    <img
                      src={book.fotos[0]}
                      alt={`Capa do livro ${book.titulo}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-ink-muted">
                      Sem capa
                    </div>
                  )}
                </div>
                <div className="border-t border-line/25 bg-white p-3">
                  <p className="text-sm font-semibold leading-snug text-ink">
                    {book.titulo}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{book.autor}</p>
                </div>
              </Link>
            ))}
            {!isLoading && !userBooks.length ? (
              <p className="col-span-full py-4 text-center text-sm text-ink-muted">
                Nenhum livro publicado.
              </p>
            ) : null}
          </div>
        </article>

        <article className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
          <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
            Avaliacoes
          </h2>
          <div className="mt-4 space-y-3">
            {isLoadingReviews ? (
              <p className="text-sm text-ink-dim">Carregando avaliacoes...</p>
            ) : null}
            {reviewsError ? (
              <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep">
                {reviewsError}
              </p>
            ) : null}
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-line/35 bg-[#fbfaf7] p-3"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <MessageSquare size={15} className="text-brand-deep" />
                  {review.reviewer?.nome_completo ?? 'Usuario'}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-dim">
                  {review.comentario ?? 'Sem comentario.'}
                </p>
              </div>
            ))}
            {!isLoadingReviews && !reviewsError && !reviews.length ? (
              <p className="py-4 text-center text-sm text-ink-muted">
                Sem avaliacoes ainda.
              </p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <h2 className="border-l-4 border-brand-deep pl-3 text-base font-semibold text-ink">
          Resumo
        </h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Livros ativos
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-ink">
              {profile?.books?.length ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Trocas feitas
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">9</p>
          </div>
          <div className="rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Doacoes
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">4</p>
          </div>
        </div>
      </section>
    </main>
  )
}
