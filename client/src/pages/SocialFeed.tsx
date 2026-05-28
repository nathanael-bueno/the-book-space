import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarDays,
  Edit,
  Filter,
  Heart,
  MessageCircle,
  PenSquare,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react'
import ReportDialog from '../components/ui/ReportDialog'
import { getCurrentUserId } from '../services/auth'
import { listFollowedUserIds } from '../services/follows'
import { ApiError } from '../services/http'
import {
  createPostComment,
  deletePost,
  likePost,
  listPostComments,
  listPosts,
  reportPost,
  unlikePost,
  type ApiPost,
  type ApiPostComment,
} from '../services/posts'
import { listGenres, type ApiGenre } from '../services/books'
import { useToast } from '../stores/useToast'

export default function SocialFeed() {
  const navigate = useNavigate()
  const toast = useToast()
  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() =>
    listFollowedUserIds()
  )
  const [genres, setGenres] = useState<ApiGenre[]>([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, ApiPostComment[]>
  >({})
  const [commentsPageByPost, setCommentsPageByPost] = useState<
    Record<string, number>
  >({})
  const [commentsLastPageByPost, setCommentsLastPageByPost] = useState<
    Record<string, number>
  >({})
  const [isCommentsOpen, setIsCommentsOpen] = useState<Record<string, boolean>>(
    {}
  )
  const [commentInputByPost, setCommentInputByPost] = useState<
    Record<string, string>
  >({})
  const [reportTarget, setReportTarget] = useState<{
    postId: string
    title: string
  } | null>(null)

  useEffect(() => {
    function syncFollowedUsers() {
      setFollowedUserIds(listFollowedUserIds())
    }

    window.addEventListener(
      'book-space:followed-users-changed',
      syncFollowedUsers
    )
    return () => {
      window.removeEventListener(
        'book-space:followed-users-changed',
        syncFollowedUsers
      )
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadGenres() {
      try {
        const response = await listGenres()
        if (!active) return
        setGenres(response.data)
      } catch {
        if (!active) return
        setGenres([])
      }
    }

    void loadGenres()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const response = await listPosts({
          id_genero: selectedGenreId || undefined,
          per_page: 30,
        })
        if (!active) return
        setPosts(response.data)
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            err instanceof ApiError
              ? err.message
              : 'Nao foi possivel carregar o feed social.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [selectedGenreId])

  const prioritizedPosts = useMemo(() => {
    if (!followedUserIds.length) return posts

    const followed = new Set(followedUserIds)
    return [...posts].sort((a, b) => {
      const aFollowed = followed.has(a.id_usuario) ? 1 : 0
      const bFollowed = followed.has(b.id_usuario) ? 1 : 0
      if (aFollowed !== bFollowed) return bFollowed - aFollowed
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [followedUserIds, posts])

  async function onToggleLike(postId: string, likedByMe: boolean) {
    try {
      if (likedByMe) {
        await unlikePost(postId)
      } else {
        await likePost(postId)
      }

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post
          const currentLikes = post.likes_count ?? 0
          return {
            ...post,
            liked_by_me: !likedByMe,
            likes_count: likedByMe
              ? Math.max(currentLikes - 1, 0)
              : currentLikes + 1,
          }
        })
      )
    } catch (err) {
      toast.error({
        title: 'Erro',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel atualizar a curtida.',
      })
    }
  }

  async function onToggleComments(post: ApiPost) {
    const isOpen = Boolean(isCommentsOpen[post.id])
    if (isOpen) {
      setIsCommentsOpen((prev) => ({ ...prev, [post.id]: false }))
      return
    }

    setIsCommentsOpen((prev) => ({ ...prev, [post.id]: true }))
    if (commentsByPost[post.id]) return

    try {
      const response = await listPostComments(post.id)
      setCommentsByPost((prev) => ({ ...prev, [post.id]: response.data }))
      setCommentsPageByPost((prev) => ({
        ...prev,
        [post.id]: response.current_page,
      }))
      setCommentsLastPageByPost((prev) => ({
        ...prev,
        [post.id]: response.last_page,
      }))
    } catch (err) {
      toast.error({
        title: 'Erro',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar comentarios.',
      })
    }
  }

  async function onLoadMoreComments(postId: string) {
    const nextPage = (commentsPageByPost[postId] ?? 1) + 1
    const lastPage = commentsLastPageByPost[postId] ?? 1
    if (nextPage > lastPage) return

    try {
      const response = await listPostComments(postId, 20, nextPage)
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), ...response.data],
      }))
      setCommentsPageByPost((prev) => ({
        ...prev,
        [postId]: response.current_page,
      }))
      setCommentsLastPageByPost((prev) => ({
        ...prev,
        [postId]: response.last_page,
      }))
    } catch (err) {
      toast.error({
        title: 'Erro',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar mais comentarios.',
      })
    }
  }

  async function onSubmitComment(postId: string) {
    const text = (commentInputByPost[postId] ?? '').trim()
    if (!text) return

    try {
      const response = await createPostComment(postId, text)

      setCommentInputByPost((prev) => ({ ...prev, [postId]: '' }))
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), response.data],
      }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments_count: (post.comments_count ?? 0) + 1 }
            : post
        )
      )
    } catch (err) {
      toast.error({
        title: 'Erro',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel comentar no post.',
      })
    }
  }

  async function onConfirmReport(motivo: string) {
    if (!reportTarget) return
    const { postId } = reportTarget
    setReportTarget(null)

    try {
      await reportPost(postId, motivo)
      toast.success({
        title: 'Denuncia enviada',
        message: 'A moderacao vai analisar o conteudo reportado.',
      })
    } catch (err) {
      toast.error({
        title: 'Erro',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel registrar a denuncia.',
      })
    }
  }

  async function onDeletePost(post: ApiPost) {
    const confirmed = window.confirm(`Excluir o post "${post.titulo}"?`)
    if (!confirmed) return

    try {
      await deletePost(post.id)
      setPosts((prev) => prev.filter((item) => item.id !== post.id))
      toast.success({
        title: 'Post excluido',
        message: 'Seu post foi removido com sucesso.',
      })
    } catch (err) {
      toast.error({
        title: 'Erro ao excluir',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel excluir o post.',
      })
    }
  }

  return (
    <main className="mx-auto w-full space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-ink">Feed social</h1>
          <p className="max-w-2xl text-sm leading-5 text-ink-dim">
            Descubra conversas, indicacoes e pedidos de troca de leitores perto
            de voce.
          </p>
        </div>
        <Link
          to="/app/posts/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line/35 bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <PenSquare size={16} />
          Criar post
        </Link>
      </section>

      <section className="rounded-xl border border-line/35 bg-white p-3 shadow-sm sm:p-3.5">
        <label className="block">
          <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <Filter size={14} />
            Filtrar recomendacoes por genero
          </span>
          <select
            value={selectedGenreId}
            onChange={(event) => setSelectedGenreId(event.target.value)}
            className="h-9 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          >
            <option value="">Todos os generos</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.nome}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3">
        {isLoading ? (
          <p className="rounded-lg border border-line/30 bg-white p-3 text-sm text-ink-dim">
            Carregando feed social...
          </p>
        ) : null}

        {prioritizedPosts.map((post) => {
          const postAuthor =
            post.author?.nome_completo ?? 'Leitor da comunidade'
          const postDate = post.created_at
            ? new Date(post.created_at).toLocaleDateString('pt-BR')
            : null
          const isOwner =
            Boolean(currentUserId) && post.id_usuario === currentUserId

          return (
            <article
              key={post.id}
              className="rounded-xl border border-line/35 bg-white p-3 shadow-sm sm:p-4"
            >
              <header className="flex items-start gap-3 border-b border-line/20 pb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/35 bg-[#fbfaf7] text-ink-muted">
                  <UserRound size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{postAuthor}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <CalendarDays size={13} />
                    {postDate ? `Publicado em ${postDate}` : 'Publicado agora'}
                  </p>
                </div>
              </header>

              <div className="pt-3">
                <h2 className="text-base font-semibold leading-tight text-ink">
                  {post.titulo}
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink-dim">
                  {post.conteudo}
                </p>
              </div>

              {post.imagem_url ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-line/25 bg-white">
                  <img
                    src={post.imagem_url}
                    alt={`Imagem do post ${post.titulo}`}
                    className="max-h-80 w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/25 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    void onToggleLike(post.id, Boolean(post.liked_by_me))
                  }
                  className={`inline-flex h-8 min-w-[84px] items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors ${
                    post.liked_by_me
                      ? 'border-accent/35 bg-[#eef7f4] text-accent'
                      : 'border-line/35 bg-white text-ink-dim hover:border-accent/35 hover:text-brand-deep'
                  }`}
                >
                  <Heart
                    size={14}
                    className={post.liked_by_me ? 'fill-current' : ''}
                  />
                  {post.likes_count ?? 0}
                </button>
                <button
                  type="button"
                  onClick={() => void onToggleComments(post)}
                  className="inline-flex h-8 min-w-[84px] items-center justify-center gap-1.5 rounded-md border border-line/35 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  <MessageCircle size={14} />
                  {post.comments_count ?? 0}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReportTarget({ postId: post.id, title: post.titulo })
                  }
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line/35 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                >
                  <AlertTriangle size={14} />
                  Denunciar
                </button>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/posts/${post.id}/edit`)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line/35 bg-white px-2.5 text-xs font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeletePost(post)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-brand-deep/25 bg-brand-deep/5 px-2.5 text-xs font-semibold text-brand-deep transition-colors hover:border-brand-deep/40 hover:bg-brand-deep/10"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </>
                ) : null}
              </div>

              {isCommentsOpen[post.id] ? (
                <section className="mt-3 space-y-2.5 border-t border-line/25 bg-[#fcfbf9] px-2.5 py-3 sm:px-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Comentarios
                  </p>

                  <div className="space-y-2">
                    {(
                      commentsByPost[post.id] ??
                      post.latest_comments ??
                      []
                    ).map((comment) => (
                      <article
                        key={comment.id}
                        className="rounded-md border border-line/30 bg-white px-2.5 py-2"
                      >
                        <p className="text-xs font-semibold text-ink">
                          {comment.author?.nome_completo ??
                            'Leitor da comunidade'}
                        </p>
                        <p className="mt-1 text-sm text-ink-dim">
                          {comment.conteudo}
                        </p>
                      </article>
                    ))}
                  </div>
                  {(commentsPageByPost[post.id] ?? 1) <
                  (commentsLastPageByPost[post.id] ?? 1) ? (
                    <button
                      type="button"
                      onClick={() => void onLoadMoreComments(post.id)}
                      className="text-xs font-semibold text-brand-deep transition-colors hover:text-accent"
                    >
                      Carregar mais comentarios
                    </button>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <input
                      value={commentInputByPost[post.id] ?? ''}
                      onChange={(event) =>
                        setCommentInputByPost((prev) => ({
                          ...prev,
                          [post.id]: event.target.value,
                        }))
                      }
                      placeholder="Escreva um comentario"
                      className="h-9 w-full rounded-md border border-line/35 bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent/35"
                    />
                    <button
                      type="button"
                      onClick={() => void onSubmitComment(post.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line/35 bg-white text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
                      aria-label="Enviar comentário"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </section>
              ) : null}
            </article>
          )
        })}

        {!isLoading && !posts.length ? (
          <section className="ui-empty-state flex flex-col items-center gap-2">
            <PenSquare
              size={32}
              className="text-brand-deep"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-ink">
              Nenhum post publicado ainda.
            </p>
            <p className="text-sm">
              Seja o primeiro a compartilhar uma leitura.
            </p>
          </section>
        ) : null}
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
