import { Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

export function withSuspense(
  Component: LazyExoticComponent<ComponentType<object>>
) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen w-full items-center justify-center px-4">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-ink-dim">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-line/45 border-t-brand-deep" />
            Carregando...
          </div>
        </main>
      }
    >
      <Component />
    </Suspense>
  )
}
