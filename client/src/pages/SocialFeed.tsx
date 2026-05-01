import { Link } from 'react-router-dom'
import {
  BookOpen,
  Heart,
  MessageCircle,
  PenSquare,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { books } from '../data/books'

const recommendedPosts = [
  {
    id: 'feed-1',
    author: 'Ana Ribeiro',
    title: 'Por que Grande Sertao ainda prende tanto?',
    content:
      'Reli alguns trechos esta semana e fiquei impressionada com como a linguagem muda o ritmo da leitura. Quero trocar ideias com quem tambem curte literatura brasileira.',
    linkedBookId: '2',
    likes: 42,
    comments: 12,
  },
  {
    id: 'feed-2',
    author: 'Bruno Costa',
    title: 'Clube de leitura em Salvador',
    content:
      'Estamos montando uma roda mensal para discutir romances nacionais e circular exemplares entre bairros proximos.',
    linkedBookId: '3',
    likes: 28,
    comments: 8,
  },
  {
    id: 'feed-3',
    author: 'Carla Mendes',
    title: 'Livros curtos para voltar ao habito',
    content:
      'O Alienista e A Hora da Estrela funcionaram muito bem para retomar uma rotina de leitura sem pressa.',
    likes: 35,
    comments: 6,
  },
]

export default function SocialFeed() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <Sparkles size={15} />
              Recomendacoes da comunidade
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              Feed social
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">
              Descubra conversas, indicacoes e pedidos de troca de leitores
              perto de voce.
            </p>
          </div>
          <Link
            to="/posts/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <PenSquare size={17} />
            Criar post
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {recommendedPosts.map((post) => {
          const linkedBook = post.linkedBookId
            ? books.find((book) => book.id === post.linkedBookId)
            : undefined

          return (
            <article
              key={post.id}
              className="rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-[#fbfaf7] text-brand-deep">
                  <UserRound size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {post.author}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-tight text-ink">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-ink-dim">
                    {post.content}
                  </p>
                </div>
              </div>

              {linkedBook ? (
                <Link
                  to={`/books/${linkedBook.id}`}
                  className="mt-4 flex gap-3 rounded-lg border border-line/35 bg-[#fbfaf7] p-3 transition-colors hover:border-accent/35"
                >
                  <img
                    src={linkedBook.cover}
                    alt={`Capa do livro ${linkedBook.title}`}
                    className="h-20 w-14 rounded-md object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
                      <BookOpen size={14} />
                      Livro vinculado
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">
                      {linkedBook.title}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {linkedBook.author}
                    </p>
                  </div>
                </Link>
              ) : null}

              <div className="mt-4 flex items-center gap-4 border-t border-line/35 pt-4 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Heart size={16} className="text-brand-deep" />
                  {post.likes} curtidas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle size={16} className="text-brand-deep" />
                  {post.comments} comentarios
                </span>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
