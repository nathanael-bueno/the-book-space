import { useEffect, useState } from 'react'

const COOKIE_CONSENT_KEY = 'tbs_cookie_consent_v1'

type CookieChoice = 'accepted' | 'essential_only'

function persistChoice(choice: CookieChoice) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice)
  } catch {}
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COOKIE_CONSENT_KEY)
      setIsVisible(!saved)
    } catch {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  return (
    <section className="fixed inset-x-3 bottom-3 z-[70] rounded-xl border border-line/50 bg-white p-3 shadow-xl sm:inset-x-auto sm:right-4 sm:max-w-md sm:p-3.5">
      <h2 className="text-sm font-semibold text-ink">Aviso de cookies</h2>
      <p className="mt-1 text-sm leading-6 text-ink-dim">
        Usamos cookies para manter seu login, proteger sua conta e melhorar sua
        experiencia no The Book Space.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            persistChoice('essential_only')
            setIsVisible(false)
          }}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-line/55 bg-white px-3 text-sm font-semibold text-ink-dim transition-colors hover:border-brand-deep/35 hover:text-brand-deep"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          onClick={() => {
            persistChoice('accepted')
            setIsVisible(false)
          }}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3.5 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
        >
          Aceitar cookies
        </button>
      </div>
    </section>
  )
}
