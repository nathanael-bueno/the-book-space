import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Sparkles, UserRound } from 'lucide-react'

const todayPosts = [
  {
    id: 'home-feed-1',
    author: 'Ana Ribeiro',
    title: 'Por que Grande Sertao ainda prende tanto?',
    content:
      'Reli alguns trechos esta semana e a leitura ficou ainda melhor na releitura.',
    likes: 42,
    comments: 12,
  },
  {
    id: 'home-feed-2',
    author: 'Bruno Costa',
    title: 'Clube de leitura em Salvador',
    content:
      'Estamos montando roda mensal para discutir romances nacionais e trocar exemplares.',
    likes: 28,
    comments: 8,
  },
]

export default function Home() {
  return (
    <main className="mx-auto w-full">
      <section className="mb-5 rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <div className="mb-4 flex items-center justify-between gap-2.5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            <Sparkles size={15} />
            Postado hoje
          </p>
          <Link
            to="/app/feed"
            className="text-sm font-semibold text-ink-dim transition-colors hover:text-brand-deep"
          >
            Ver tudo
          </Link>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          {todayPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-line/35 bg-[#fbfaf7] p-3"
            >
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-accent/15 bg-white text-brand-deep">
                  <UserRound size={15} />
                </span>
                {post.author}
              </div>
              <h3 className="text-sm font-semibold text-ink">{post.title}</h3>
              <p className="mt-1 text-xs leading-5 text-ink-dim">
                {post.content}
              </p>
              <div className="mt-3 flex items-center gap-2.5 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <Heart size={14} className="text-brand-deep" />
                  {post.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} className="text-brand-deep" />
                  {post.comments}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <p className="text-sm text-ink-dim">
          Para buscar livros por categoria, estado e localizacao, abra o
          catalogo.
        </p>
        <Link
          to="/app/catalog"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          Ir para catalogo
        </Link>
      </section>
    </main>
  )
}
