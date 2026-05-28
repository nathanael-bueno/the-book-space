import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, MessageSquare, Star } from 'lucide-react'
import ReportDialog from '../components/ui/ReportDialog'
import { getCurrentUserId } from '../services/auth'
import { isFollowingUser, toggleFollowUser } from '../services/follows'
import { ApiError } from '../services/http'
import { createReport } from '../services/reports'
import {
  getPublicProfile,
  type Profile as ProfileData,
} from '../services/profile'
import {
  listUserReviews,
  type ApiReview,
} from '../services/reviews'
import { useToast } from '../stores/useToast'

export default function PublicProfile() {
  const toast = useToast()
  const { userId } = useParams()
  const hasInvalidUserId = !userId
  const currentUserId = getCurrentUserId()
  const isOwnProfile = Boolean(currentUserId) && currentUserId === userId
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reportTarget, setReportTarget] = useState<{
    title: string
    target: string
  } | null>(null)
  const [, forceFollowRefresh] = useState(0)

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

  async function onReportReview(review: ApiReview) {
    setReportTarget({
      title: `Avaliacao de ${review.reviewer?.nome_completo ?? 'usuario'}`,
      target: `[AVALIACAO:${review.id}] ${review.comentario ?? 'Sem comentario'}`,
    })
  }

  async function onConfirmReport(motivo: string) {
    if (!reportTarget) return
    try {
      await createReport({ alvo: reportTarget.target, motivo })
      setReportTarget(null)
      toast.success({
        title: 'Denuncia enviada',
        message: 'A denuncia foi encaminhada para moderacao.',
      })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel registrar a denuncia.'

      toast.error({
        title: 'Erro',
        message,
      })
    }
  }

  function onToggleFollow() {
    if (!userId || isOwnProfile) return
    const next = toggleFollowUser(userId)
    forceFollowRefresh((value) => value + 1)
    toast.success({
      title: next ? 'Usuario seguido' : 'Usuario removido',
      message: next
        ? 'As recomendacoes desse leitor vao aparecer primeiro no seu feed.'
        : 'As recomendacoes voltaram para a ordem padrao do feed.',
    })
  }

  const isFollowing = userId ? isFollowingUser(userId) : false

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/app/feed"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <h1 className="text-2xl font-semibold text-ink">
            {profile?.nome_completo ?? 'Usuario'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isOwnProfile ? (
            <button
              type="button"
              onClick={onToggleFollow}
              className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors ${
                isFollowing
                  ? 'border-accent/45 bg-[#eef7f4] text-accent hover:border-accent/60'
                  : 'border-line/35 bg-white text-ink-dim hover:border-accent/35 hover:text-brand-deep'
              }`}
            >
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          ) : null}
          {!isOwnProfile ? (
            <button
              type="button"
              onClick={() =>
                setReportTarget({
                  title: profile?.nome_completo ?? 'Usuario',
                  target: `[PERFIL:${userId}] ${profile?.nome_completo ?? 'Usuario'}`,
                })
              }
              className="inline-flex h-9 items-center justify-center rounded-md border border-line/35 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              Denunciar perfil
            </button>
          ) : null}
          <div className="rounded-xl border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
              <Star size={16} fill="currentColor" />
              {averageRating}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {totalReviews} avaliacoes
            </p>
          </div>
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
                <button
                  type="button"
                  onClick={() => void onReportReview(review)}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-md border border-line/35 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  Denunciar avaliacao
                </button>
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

      <ReportDialog
        open={Boolean(reportTarget)}
        target={reportTarget?.title ?? ''}
        onCancel={() => setReportTarget(null)}
        onConfirm={(motivo) => void onConfirmReport(motivo)}
      />
    </main>
  )
}
