import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CheckCircle2,
  Gift,
  Heart,
  MessageCircle,
  Repeat2,
} from 'lucide-react'

const notifications = [
  {
    id: 'notif-1',
    type: 'Proposta de troca',
    title: 'Ana Ribeiro quer trocar por Dom Casmurro',
    description:
      'Ela ofereceu Grande Sertao: Veredas e deixou uma mensagem para combinar a entrega.',
    time: 'Agora',
    unread: true,
    icon: Repeat2,
    actionLabel: 'Ver proposta',
    actionTo: '/books/1/trade',
  },
  {
    id: 'notif-2',
    type: 'Troca aceita',
    title: 'Sua troca por A Hora da Estrela foi aceita',
    description:
      'Eduarda Nunes aceitou sua proposta. Abra a conversa para ajustar os proximos passos.',
    time: '12 min',
    unread: true,
    icon: CheckCircle2,
    actionLabel: 'Abrir conversa',
    actionTo: '/books/6',
  },
  {
    id: 'notif-3',
    type: 'Interacao social',
    title: 'Bruno curtiu seu livro cadastrado',
    description:
      'Capitaes da Areia recebeu uma curtida e um comentario perguntando sobre o estado da capa.',
    time: 'Ontem',
    unread: false,
    icon: Heart,
    actionLabel: 'Ver livro',
    actionTo: '/books/3',
  },
  {
    id: 'notif-4',
    type: 'Comentario',
    title: 'Carla comentou em Memorias Postumas',
    description:
      'Ela quer saber se voce aceita retirar o livro no centro no fim da tarde.',
    time: 'Ontem',
    unread: false,
    icon: MessageCircle,
    actionLabel: 'Responder',
    actionTo: '/books/4',
  },
  {
    id: 'notif-5',
    type: 'Doacao confirmada',
    title: 'Doacao registrada com sucesso',
    description:
      'Seu exemplar foi marcado para doacao. Voce recebera atualizacoes quando houver interessado.',
    time: '2 dias',
    unread: false,
    icon: Gift,
    actionLabel: 'Acompanhar',
    actionTo: '/profile',
  },
]

export default function Notifications() {
  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <main className="mx-auto w-full max-w-5xl">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/15 bg-canvas/55 text-accent shadow-sm">
                <Bell size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Notificacoes
                </h1>
                <p className="mt-1 text-sm text-ink-dim">
                  {unreadCount} novas atualizacoes sobre trocas, interacoes e
                  doacoes.
                </p>
              </div>
            </div>
            <span className="inline-flex h-9 items-center justify-center rounded-lg border border-line/45 bg-[#fbfaf7] px-3 text-sm font-semibold text-brand-deep">
              {notifications.length} no total
            </span>
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {notifications.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 shadow-sm transition-colors sm:p-5 ${
                item.unread
                  ? 'border-accent/30 bg-white'
                  : 'border-line/45 bg-white'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                      item.unread
                        ? 'border-accent/20 bg-[#fbfaf7] text-accent'
                        : 'border-line/35 bg-white text-brand-deep'
                    }`}
                  >
                    <Icon size={21} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
                        {item.type}
                      </p>
                      {item.unread ? (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      ) : null}
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-ink">
                      {item.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-dim">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="text-sm font-medium text-ink-muted">
                    {item.time}
                  </span>
                  <Link
                    to={item.actionTo}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-line/55 bg-white px-3 text-sm font-semibold text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
                  >
                    {item.actionLabel}
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mt-5 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <BookOpen size={22} className="mt-0.5 text-brand-deep" />
          <div>
            <h2 className="text-base font-semibold text-ink">
              Preferencias ativas
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-dim">
              Voce recebe alertas para novas propostas, respostas de troca,
              curtidas, comentarios e confirmacoes de doacao.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
