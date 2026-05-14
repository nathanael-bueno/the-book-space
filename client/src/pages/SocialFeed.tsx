import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, PenSquare, UserRound } from 'lucide-react'
import { ApiError } from '../services/http'
import { listPosts, type ApiPost } from '../services/posts'

export default function SocialFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await listPosts()
        if (!active) return
        setPosts(response.data)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel carregar o feed social.'
        )
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Feed social</h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
            Descubra conversas, indicacoes e pedidos de troca de leitores perto
            de voce.
          </p>
        </div>
        <Link
          to="/app/posts/new"
          className="ui-btn inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          <PenSquare size={17} />
          Criar post
        </Link>
      </section>

      <section className="space-y-2.5">
        {isLoading ? (
          <p className="rounded-xl border border-line/45 bg-white p-3 text-sm text-ink-dim shadow-sm sm:p-3.5">
            Carregando feed social...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
            {error}
          </p>
        ) : null}

        {posts.map((post) => {
          const postAuthor =
            post.author?.nome_completo ?? 'Leitor da comunidade'
          const linkedBook = post.book
          const postDate = post.created_at
            ? new Date(post.created_at).toLocaleDateString('pt-BR')
            : null

          return (
            <article
              key={post.id}
              className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5"
            >
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-[#fbfaf7] text-brand-deep">
                  <UserRound size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{postAuthor}</p>
                  <h2 className="mt-0.5 text-base font-semibold leading-tight text-ink sm:text-lg">
                    {post.titulo}
                  </h2>
                  <p className="mt-1.5 text-sm leading-5 text-ink-dim">
                    {post.conteudo}
                  </p>
                </div>
              </div>

              {post.imagem_url ? (
                <div className="mt-2.5 overflow-hidden rounded-lg border border-line/35 bg-white p-2">
                  <img
                    src={post.imagem_url}
                    alt={`Imagem do post ${post.titulo}`}
                    className="max-h-72 w-full rounded object-cover"
                  />
                </div>
              ) : null}

              {linkedBook ? (
                <Link
                  to={`/app/books/${linkedBook.id}`}
                  className="mt-2.5 flex gap-2 rounded-lg border border-line/35 bg-[#fbfaf7] p-2 transition-colors hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
                      Livro vinculado
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                      {linkedBook.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {linkedBook.autor}
                    </p>
                  </div>
                </Link>
              ) : null}

              <div className="mt-2.5 flex items-center gap-2.5 border-t border-line/35 pt-2.5 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-brand-deep" />
                  {postDate ? `Publicado em ${postDate}` : 'Publicado agora'}
                </span>
              </div>
            </article>
          )
        })}

        {!isLoading && !error && !posts.length ? (
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
    </main>
  )
}
