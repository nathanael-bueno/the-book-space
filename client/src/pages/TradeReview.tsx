import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Send, Star } from 'lucide-react'
import { ApiError } from '../services/http'
import { submitTradeReview } from '../services/trades'
import { useToast } from '../stores/useToast'

const ratingLabels = ['Ruim', 'Regular', 'Boa', 'Muito boa', 'Excelente']

export default function TradeReview() {
  const toast = useToast()
  const { tradeId } = useParams()
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tradeId) return

    setIsSubmitting(true)
    try {
      await submitTradeReview(tradeId, {
        nota: rating,
        comentario: comment.trim() || undefined,
      })
      setSubmitted(true)
      toast.success({
        title: 'Avaliacao enviada',
        message: 'Sua avaliacao foi registrada com sucesso.',
      })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Nao foi possivel enviar a avaliacao.'
      toast.error({ title: 'Erro ao avaliar', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full space-y-3">
      <section className="rounded-xl border border-line/45 bg-white p-3 shadow-sm sm:p-3.5">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <Link
              to={`/app/trades/${tradeId ?? ''}`}
              className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
            >
              <ChevronLeft size={16} />
              Voltar para detalhes
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-ink">
                Como foi a troca?
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-ink-dim">
                Avalie a experiencia com o outro leitor e deixe um comentario
                breve.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">
              Nota: {ratingLabels[rating - 1]}
            </p>
            <div className="mt-3 flex gap-2">
              {ratingLabels.map((label, index) => {
                const value = index + 1
                const isActive = value <= rating
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} estrelas: ${label}`}
                    className="rounded-lg p-1 text-accent transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <Star
                      size={30}
                      fill={isActive ? 'currentColor' : 'none'}
                      className={isActive ? 'text-accent' : 'text-ink-muted'}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-ink">Comentario</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Conte como foi a comunicacao, pontualidade e estado do livro."
              className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-white px-3 py-2.5 text-sm leading-6 text-ink shadow-sm outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
            />
          </label>

          {submitted ? (
            <p className="mt-4 rounded-lg border border-accent/25 bg-[#fbfaf7] px-3 py-2.5 text-sm font-semibold text-brand-deep">
              Avaliacao enviada com sucesso.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || submitted}
            className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep disabled:opacity-60 sm:w-auto"
          >
            <Send size={17} />
            {isSubmitting ? 'Enviando...' : 'Enviar avaliacao'}
          </button>
        </form>
      </section>
    </main>
  )
}
