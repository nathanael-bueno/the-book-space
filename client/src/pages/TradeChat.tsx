import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, MessageSquareText, Send } from 'lucide-react'
import { ApiError } from '../services/http'
import { getCurrentUserId } from '../services/auth'
import {
  listTradeMessages,
  sendTradeMessage,
  type ApiTradeMessage,
} from '../services/trades'
import { useToast } from '../stores/useToast'

function normalizeMessagesPayload(payload: unknown): ApiTradeMessage[] {
  if (Array.isArray(payload)) {
    return payload as ApiTradeMessage[]
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ApiTradeMessage[] }).data
  }

  return []
}

export default function TradeChat() {
  const toast = useToast()
  const { tradeId } = useParams()
  const hasInvalidTradeId = !tradeId
  const currentUserId = useMemo(() => getCurrentUserId(), [])
  const [messages, setMessages] = useState<ApiTradeMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!tradeId) return
    const safeTradeId = tradeId

    let active = true

    async function load() {
      setIsLoading(true)
      try {
        const messagesResponse = await listTradeMessages(safeTradeId)
        if (!active) return
        setMessages(normalizeMessagesPayload(messagesResponse.data))
      } catch (err) {
        if (!active) return
        toast.error({
          title: 'Erro',
          message:
            err instanceof ApiError
              ? err.message
              : 'Nao foi possivel carregar o chat da troca.',
        })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()

    const intervalId = window.setInterval(async () => {
      try {
        const messagesResponse = await listTradeMessages(safeTradeId)
        if (!active) return
        setMessages(normalizeMessagesPayload(messagesResponse.data))
      } catch {
        // Ignora falhas temporarias de polling para nao interromper o chat.
      }
    }, 8000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [toast, tradeId])

  if (hasInvalidTradeId) {
    return (
      <main className="mx-auto w-full space-y-3">
        <section className="rounded-xl border border-brand-deep/25 bg-brand-deep/5 p-3 text-sm font-medium text-brand-deep shadow-sm sm:p-3.5">
          Troca invalida.
        </section>
      </main>
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tradeId) return

    const trimmedDraft = draft.trim()
    if (!trimmedDraft) return

    setIsSending(true)
    try {
      const response = await sendTradeMessage(tradeId, trimmedDraft)
      setMessages((currentMessages) => [...currentMessages, response.data])
      setDraft('')
    } catch (err) {
      toast.error({
        title: 'Erro ao enviar',
        message:
          err instanceof ApiError
            ? err.message
            : 'Nao foi possivel enviar mensagem.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to={`/app/trades/${tradeId ?? ''}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <h1 className="text-2xl font-semibold text-ink">Chat da troca</h1>
        </div>
      </section>

      <section className="rounded-xl border border-line/45 bg-white shadow-sm">
        <div className="border-b border-line/35 p-3 sm:p-3.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep">
            <MessageSquareText size={22} className="text-brand-deep" />
            Conversa ativa
          </p>
        </div>

        {isLoading ? (
          <div className="p-3 text-sm text-ink-dim sm:p-3.5">
            Carregando mensagens...
          </div>
        ) : null}

        <div className="space-y-2.5 bg-[#fbfaf7] p-3 sm:p-3.5">
          {!isLoading && !messages.length ? (
            <div className="rounded-lg border border-line/35 bg-white px-3 py-2.5 text-sm text-ink-dim">
              Nenhuma mensagem ainda nesta troca.
            </div>
          ) : null}

          {messages.map((message) => {
            const isMine = message.id_remetente === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl border px-4 py-2.5 shadow-sm sm:max-w-[70%] ${
                    isMine
                      ? 'border-accent/20 bg-accent text-white'
                      : 'border-line/45 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <p
                      className={`text-xs font-semibold ${
                        isMine ? 'text-white' : 'text-brand-deep'
                      }`}
                    >
                      {message.sender?.nome_completo ?? 'Leitor'}
                    </p>
                    <p
                      className={`text-xs ${
                        isMine ? 'text-white/80' : 'text-ink-muted'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString(
                        'pt-BR',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6">{message.mensagem}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form
          className="flex flex-col gap-2.5 border-t border-line/45 p-4 sm:flex-row sm:p-5"
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
            className="h-9 flex-1 rounded-lg border border-line/55 bg-white px-3 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={isSending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:opacity-60"
          >
            <Send size={17} />
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </section>
    </main>
  )
}
