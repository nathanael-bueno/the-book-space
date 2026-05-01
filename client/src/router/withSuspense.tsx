import { Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

export function withSuspense(
  Component: LazyExoticComponent<ComponentType<object>>
) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl rounded-2xl border border-line/45 bg-white p-5 text-sm text-ink-dim shadow-sm">
          Carregando...
        </main>
      }
    >
      <Component />
    </Suspense>
  )
}
