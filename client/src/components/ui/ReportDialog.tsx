import { useState } from 'react'

type ReportDialogProps = {
  open: boolean
  target: string
  onCancel: () => void
  onConfirm: (motivo: string) => void
}

export default function ReportDialog({
  open,
  target,
  onCancel,
  onConfirm,
}: ReportDialogProps) {
  const [motivo, setMotivo] = useState('')

  if (!open) return null

  function handleConfirm() {
    const trimmed = motivo.trim()
    if (!trimmed) return
    onConfirm(trimmed)
    setMotivo('')
  }

  function handleCancel() {
    setMotivo('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-xl border border-line/45 bg-white p-4 shadow-xl sm:p-5">
        <h2 className="text-lg font-semibold text-ink">Denunciar conteudo</h2>
        <p className="mt-1 text-sm text-ink-dim">
          Alvo: <span className="font-medium text-ink">{target}</span>
        </p>

        <div className="mt-4">
          <label
            htmlFor="report-motivo"
            className="block text-sm font-medium text-ink-dim"
          >
            Motivo da denuncia
          </label>
          <textarea
            id="report-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Descreva o motivo da denuncia..."
            className="mt-1.5 w-full resize-none rounded-lg border border-line/45 bg-[#fbfaf7] px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/12"
          />
          <p className="mt-1 text-right text-xs text-ink-muted">
            {motivo.length}/500
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-9 items-center rounded-lg border border-line/45 bg-white px-4 text-sm font-semibold text-ink-dim transition-colors hover:border-accent/35 hover:text-brand-deep"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!motivo.trim()}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enviar denuncia
          </button>
        </div>
      </div>
    </div>
  )
}
