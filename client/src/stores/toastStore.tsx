import { createContext, useCallback, useMemo, useReducer } from 'react'
import type { PropsWithChildren } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

type ToastState = {
  items: Toast[]
}

type ToastAction =
  | { type: 'add'; payload: Toast }
  | { type: 'remove'; payload: { id: string } }

type ShowToastInput = {
  title: string
  message?: string
  durationMs?: number
}

type ToastContextValue = {
  toasts: Toast[]
  success: (input: ShowToastInput) => void
  error: (input: ShowToastInput) => void
  info: (input: ShowToastInput) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
export { ToastContext }

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  if (action.type === 'add') {
    return { items: [action.payload, ...state.items].slice(0, 5) }
  }
  if (action.type === 'remove') {
    return {
      items: state.items.filter((item) => item.id !== action.payload.id),
    }
  }
  return state
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(toastReducer, { items: [] })

  const remove = useCallback((id: string) => {
    dispatch({ type: 'remove', payload: { id } })
  }, [])

  const notify = useCallback(
    (variant: ToastVariant, input: ShowToastInput) => {
      const id = crypto.randomUUID()
      dispatch({
        type: 'add',
        payload: { id, variant, title: input.title, message: input.message },
      })
      const timeout = input.durationMs ?? 3200
      window.setTimeout(() => remove(id), timeout)
    },
    [remove]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts: state.items,
      success: (input) => notify('success', input),
      error: (input) => notify('error', input),
      info: (input) => notify('info', input),
      remove,
    }),
    [notify, remove, state.items]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={state.items} onClose={remove} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: Toast[]
  onClose: (id: string) => void
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="pointer-events-auto rounded-xl border border-line/45 bg-white p-3 shadow-lg"
        >
          <div className="flex items-start gap-2">
            <span
              className={[
                'mt-0.5 inline-flex h-5 w-5 items-center justify-center',
                toast.variant === 'success'
                  ? 'text-success'
                  : toast.variant === 'error'
                    ? 'text-brand-deep'
                    : 'text-accent',
              ].join(' ')}
            >
              {toast.variant === 'success' ? (
                <CheckCircle2 size={16} />
              ) : toast.variant === 'error' ? (
                <TriangleAlert size={16} />
              ) : (
                <Info size={16} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs text-ink-dim">{toast.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onClose(toast.id)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-brand-deep"
              aria-label="Fechar alerta"
            >
              <X size={14} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
