import { createContext, useMemo, useSyncExternalStore } from 'react'
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
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[95] bg-white/35 backdrop-blur-[1px]">
      <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border border-line/45 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm sm:right-6 sm:top-6">
        <Loader2 size={16} className="animate-spin text-brand-deep" />
        Carregando...
      </div>
    </div>
  )
}
