import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Star } from 'lucide-react'

const ratingLabels = ['Ruim', 'Regular', 'Boa', 'Muito boa', 'Excelente']

export default function TradeReview() {
  const { tradeId } = useParams()
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <Link
        to={`/trades/${tradeId ?? 'trade-1'}`}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
      >
        <ArrowLeft size={16} />
        Voltar para detalhes
      </Link>

      <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
        <form className="p-4 sm:p-5" onSubmit={handleSubmit}>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
            Avaliacao
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Como foi a troca?
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-dim">
            Avalie a experiencia com o outro leitor e deixe um comentario breve.
          </p>

          <div className="mt-6 rounded-lg border border-line/35 bg-[#fbfaf7] px-3 py-3">
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
              Avaliacao enviada no mock.
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep sm:w-auto"
          >
            <Send size={17} />
            Enviar avaliacao
          </button>
        </form>
      </section>
    </main>
  )
}
