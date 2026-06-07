import { StatusBadge } from '../ui/StatusBadge'

type BookCardProps = {
  title: string
  cover?: string
  coverAlt: string
  metadata: string[]
  status?: string
  compact?: boolean
}

export default function BookCard({
  title,
  cover,
  coverAlt,
  metadata,
  status,
  compact = false,
}: BookCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-line/45 bg-white shadow-sm">
      <div
        className={
          compact
            ? 'aspect-[3/4] w-full bg-canvas/35'
            : 'aspect-[3/4] w-full bg-canvas/35'
        }
      >
        {cover ? (
          <img
            src={cover}
            alt={coverAlt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-ink-muted">
            Capa indisponivel
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-line/25 p-3">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          {title}
        </h2>
        <div className="space-y-1">
          {metadata.map((item) => (
            <p key={item} className="text-xs text-ink-muted">
              {item}
            </p>
          ))}
        </div>
        <StatusBadge status={status} />
      </div>
    </article>
  )
}
