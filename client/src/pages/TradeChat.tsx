import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquareText, Send } from 'lucide-react'

type Message = {
  id: string
  sender: 'me' | 'partner'
  author: string
  text: string
  time: string
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'partner',
    author: 'Ana Ribeiro',
    text: 'Oi! Ainda tenho interesse na troca.',
    time: '10:12',
  },
  {
    id: 'msg-2',
    sender: 'me',
    author: 'Voce',
    text: 'Perfeito. O livro esta em muito bom estado.',
    time: '10:18',
  },
  {
    id: 'msg-3',
    sender: 'partner',
    author: 'Ana Ribeiro',
    text: 'Podemos combinar a entrega no centro amanha?',
    time: '10:21',
  },
]

export default function TradeChat() {
  const { tradeId } = useParams()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDraft = draft.trim()
    if (!trimmedDraft) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${currentMessages.length + 1}`,
        sender: 'me',
        author: 'Voce',
        text: trimmedDraft,
        time: 'agora',
      },
    ])
    setDraft('')
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <Link
        to={`/trades/${tradeId ?? 'trade-1'}`}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar para detalhes
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <div className="border-b border-line/45 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
            Chat da troca
          </p>
          <h1 className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-ink">
            <MessageSquareText size={22} className="text-brand-deep" />
            Conversa com Ana Ribeiro
          </h1>
        </div>

        <div className="space-y-3 bg-[#fbfaf7] p-4 sm:p-5">
          {messages.map((message) => {
            const isMine = message.sender === 'me'
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[70%] ${
                    isMine
                      ? 'border-accent/20 bg-accent text-white'
                      : 'border-line/45 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p
                      className={`text-xs font-semibold ${
                        isMine ? 'text-white' : 'text-brand-deep'
                      }`}
                    >
                      {message.author}
                    </p>
                    <p
                      className={`text-xs ${
                        isMine ? 'text-white/80' : 'text-ink-muted'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6">{message.text}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form
          className="flex flex-col gap-3 border-t border-line/45 p-4 sm:flex-row sm:p-5"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="trade-message">
            Mensagem
          </label>
          <input
            id="trade-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escreva uma mensagem..."
            className="h-11 flex-1 rounded-lg border border-line/55 bg-white px-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
          >
            <Send size={17} />
            Enviar
          </button>
        </form>
      </section>
    </main>
  )
}
