import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  PenSquare,
  Send,
  Trash2,
} from 'lucide-react'
import ReportDialog from '../components/ui/ReportDialog'
import { getCurrentUserId } from '../services/auth'
import { listFollowedUserIds } from '../services/follows'
import { ApiError } from '../services/http'
import { createReport } from '../services/reports'
import {
  createPostComment,
  deletePost,
  likePost,
  listPostComments,
  listPosts,
  unlikePost,
  type ApiPost,
  type ApiPostComment,
} from '../services/posts'
import { listGenres, type ApiGenre } from '../services/books'
import { useToast } from '../stores/useToast'

function toRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'agora mesmo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `há ${days}d`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `há ${weeks} sem`
  const months = Math.floor(days / 30)
  if (months < 12) return `há ${months} mes${months > 1 ? 'es' : ''}`
  const years = Math.floor(days / 365)
  return `há ${years} ano${years > 1 ? 's' : ''}`
}

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
    target: string
    title: string
  } | null>(null)
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>(
    {}
  )
  const CONTENT_LIMIT = 280

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
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuPostId(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
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
    const { target } = reportTarget
    setReportTarget(null)

    try {
      await createReport({ alvo: target, motivo })
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
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-line/35 bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-accent/35 hover:text-brand-deep sm:w-auto"
        >
          <PenSquare size={16} />
          Criar post
        </Link>
      </section>

      {genres.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar por gênero"
        >
          <button
            type="button"
            onClick={() => setSelectedGenreId('')}
            className={`h-7 rounded-full px-3.5 text-xs font-semibold transition-colors ${
              selectedGenreId === ''
                ? 'bg-accent text-white shadow-sm shadow-accent/20'
                : 'bg-white border border-line/40 text-ink-muted hover:border-accent/35 hover:text-brand-deep'
            }`}
          >
            Todos
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => setSelectedGenreId(genre.id)}
              className={`h-7 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                selectedGenreId === genre.id
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'bg-white border border-line/40 text-ink-muted hover:border-accent/35 hover:text-brand-deep'
              }`}
            >
              {genre.nome}
            </button>
          ))}
        </div>
      ) : null}

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
            ? toRelativeTime(post.created_at)
            : 'agora mesmo'
          const isOwner =
            Boolean(currentUserId) && post.id_usuario === currentUserId

          return (
            <article
              key={post.id}
              className="rounded-xl border border-line/35 bg-white p-3 shadow-sm sm:p-4"
            >
              <header className="flex items-start gap-3 border-b border-line/20 pb-3">
                <Link
                  to={`/app/profile/${post.id_usuario}`}
                  className="shrink-0"
                  aria-label={`Ver perfil de ${postAuthor}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f0ea] text-sm font-semibold text-brand-deep">
                    {postAuthor[0].toUpperCase()}
                  </span>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/app/profile/${post.id_usuario}`}
                    className="text-sm font-semibold text-ink transition-colors hover:text-brand-deep"
                  >
                    {postAuthor}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-muted">{postDate}</p>
                </div>
              </header>

              <div className="pt-3">
                <h2 className="text-base font-semibold leading-tight text-ink">
                  {post.titulo}
                </h2>
                {(() => {
                  const isLong = post.conteudo.length > CONTENT_LIMIT
                  const isExpanded = Boolean(expandedPosts[post.id])
                  const text =
                    isLong && !isExpanded
                      ? post.conteudo.slice(0, CONTENT_LIMIT).trimEnd() + '…'
                      : post.conteudo
                  return (
                    <>
                      <p className="mt-2 text-sm leading-6 text-ink-dim">
                        {text}
                      </p>
                      {isLong ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPosts((prev) => ({
                              ...prev,
                              [post.id]: !isExpanded,
                            }))
                          }
                          className="mt-1 text-xs font-semibold text-brand-deep transition-colors hover:text-accent"
                        >
                          {isExpanded ? 'Ver menos' : 'Ver mais'}
                        </button>
                      ) : null}
                    </>
                  )
                })()}
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

              <div className="mt-3 border-t border-line/25 pt-2.5">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      void onToggleLike(post.id, Boolean(post.liked_by_me))
                    }
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                      post.liked_by_me
                        ? 'text-accent hover:bg-[#eef7f4]'
                        : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep'
                    }`}
                  >
                    <Heart
                      size={15}
                      className={post.liked_by_me ? 'fill-current' : ''}
                    />
                    <span>{post.likes_count ?? 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void onToggleComments(post)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                      isCommentsOpen[post.id]
                        ? 'text-brand-deep hover:bg-[#f3f0ea]'
                        : 'text-ink-muted hover:bg-[#fbfaf7] hover:text-brand-deep'
                    }`}
                  >
                    <MessageCircle size={15} />
                    <span>{post.comments_count ?? 0}</span>
                  </button>

                  <div
                    className="relative ml-auto"
                    ref={openMenuPostId === post.id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuPostId((prev) =>
                          prev === post.id ? null : post.id
                        )
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                      aria-label="Mais opções"
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    {openMenuPostId === post.id ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[152px] overflow-hidden rounded-xl border border-line/45 bg-white py-1 shadow-lg"
                      >
                        {!isOwner ? (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpenMenuPostId(null)
                              setReportTarget({
                                target: `[POST:${post.id}] ${post.titulo}`,
                                title: post.titulo,
                              })
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                          >
                            <AlertTriangle size={14} />
                            Denunciar post
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuPostId(null)
                                navigate(`/app/posts/${post.id}/edit`)
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-[#fbfaf7] hover:text-brand-deep"
                            >
                              <Edit size={14} />
                              Editar post
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuPostId(null)
                                void onDeletePost(post)
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-brand-deep transition-colors hover:bg-brand-deep/8"
                            >
                              <Trash2 size={14} />
                              Excluir post
                            </button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {isCommentsOpen[post.id] ? (
                <section className="mt-3 space-y-2.5 border-t border-line/25 bg-[#fcfbf9] px-2.5 py-3 sm:px-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Comentarios
                  </p>

                  <div className="space-y-3">
                    {(
                      commentsByPost[post.id] ??
                      post.latest_comments ??
                      []
                    ).map((comment) => {
                      const commentAuthor =
                        comment.author?.nome_completo ?? 'Leitor da comunidade'
                      return (
                        <div key={comment.id} className="flex gap-2.5">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f0ea] text-xs font-semibold text-brand-deep">
                            {commentAuthor[0].toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-ink">
                                {commentAuthor}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setReportTarget({
                                    target: `[COMENTARIO:${comment.id}] ${comment.conteudo.slice(0, 90)}`,
                                    title: `Comentario de ${commentAuthor}`,
                                  })
                                }
                                className="shrink-0 text-[10px] font-semibold text-ink-ghost transition-colors hover:text-brand-deep"
                              >
                                Denunciar
                              </button>
                            </div>
                            <p className="mt-0.5 text-sm leading-5 text-ink-dim">
                              {comment.conteudo}
                            </p>
                          </div>
                        </div>
                      )
                    })}
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
