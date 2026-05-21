import { CheckCircle2, Clock3, Star, XCircle } from 'lucide-react'

type BadgeTone = {
  label: string
  className: string
  icon: typeof Clock3
}

const STATUS_TONES: Record<string, BadgeTone> = {
  pendente: {
    label: 'Pendente',
    icon: Clock3,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  aceita: {
    label: 'Aceita',
    icon: CheckCircle2,
    className: 'border-accent/25 bg-[#fbfaf7] text-accent',
  },
  concluida: {
    label: 'Concluida',
    icon: Star,
    className: 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep',
  },
  recusada: {
    label: 'Recusada',
    icon: XCircle,
    className: 'border-line/35 bg-white text-ink-muted',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'border-line/35 bg-white text-ink-muted',
  },
  doado: {
    label: 'Concluida',
    icon: CheckCircle2,
    className: 'border-brand-deep/20 bg-[#fbfaf7] text-brand-deep',
  },
  disponivel: {
    label: 'Disponivel',
    icon: CheckCircle2,
    className: 'border-accent/25 bg-[#fbfaf7] text-accent',
  },
}

export function getStatusTone(rawStatus?: string, fallback = 'Indefinido') {
  const key = (rawStatus ?? '').trim().toLowerCase()
  const tone = STATUS_TONES[key]
  if (tone) return tone

  return {
    label: rawStatus?.trim() || fallback,
    icon: Clock3,
    className: 'border-line/35 bg-white text-ink-muted',
  }
}

export function StatusBadge({
  status,
  className = '',
}: {
  status?: string
  className?: string
}) {
  const tone = getStatusTone(status)
  const Icon = tone.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${tone.className} ${className}`.trim()}
    >
      <Icon size={14} />
      {tone.label}
    </span>
  )
}
