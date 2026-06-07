import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { PropsWithChildren } from 'react'
import { Loader2 } from 'lucide-react'
import { getLoadingSnapshot, subscribeLoading } from './loadingBus'

type LoadingContextValue = {
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextValue | null>(null)
export { LoadingContext }

export function LoadingProvider({ children }: PropsWithChildren) {
  const snapshot = useSyncExternalStore(
    subscribeLoading,
    getLoadingSnapshot,
    getLoadingSnapshot
  )

  const value = useMemo<LoadingContextValue>(
    () => ({ isLoading: snapshot.pendingRequests > 0 }),
    [snapshot.pendingRequests]
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalLoadingOverlay visible={value.isLoading} />
    </LoadingContext.Provider>
  )
}

function GlobalLoadingOverlay({ visible }: { visible: boolean }) {
  const SHOW_DELAY_MS = 180
  const MIN_VISIBLE_MS = 260
  const [isRendered, setIsRendered] = useState(false)
  const [shownAt, setShownAt] = useState<number | null>(null)

  useEffect(() => {
    let timerId: number | null = null

    if (visible) {
      if (!isRendered) {
        timerId = window.setTimeout(() => {
          setIsRendered(true)
          setShownAt(Date.now())
        }, SHOW_DELAY_MS)
      }
    } else if (isRendered) {
      const elapsed = shownAt ? Date.now() - shownAt : MIN_VISIBLE_MS
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      timerId = window.setTimeout(() => {
        setIsRendered(false)
        setShownAt(null)
      }, remaining)
    }

    return () => {
      if (timerId !== null) window.clearTimeout(timerId)
    }
  }, [visible, isRendered, shownAt])

  if (!isRendered) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-white/35 backdrop-blur-[1px]">
      <div className="inline-flex items-center gap-2 rounded-lg border border-line/45 bg-white px-4 py-2.5 text-sm font-medium text-ink-dim shadow-md">
        <Loader2 size={16} className="animate-spin text-brand-deep" />
        Carregando...
      </div>
    </div>
  )
}
