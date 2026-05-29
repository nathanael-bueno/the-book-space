import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { clearToken, getToken } from '../services/auth'
import { ApiError } from '../services/http'
import { getMyProfile, type Profile } from '../services/profile'

type AuthUser = Pick<Profile, 'nome_completo' | 'email' | 'foto'>

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isProfileComplete: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(true)

  async function refreshUser() {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsProfileComplete(true)
      setIsLoading(false)
      return
    }

    try {
      const response = await getMyProfile()
      const profile = response.data

      setUser({
        nome_completo: profile.nome_completo,
        email: profile.email,
        foto: profile.foto,
      })
      setIsProfileComplete(
        Boolean(profile.cidade && profile.estado && profile.faixa_etaria)
      )
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearToken()
      }

      setUser(null)
      setIsProfileComplete(true)
    } finally {
      setIsLoading(false)
    }
  }

  function clearUser() {
    setUser(null)
    setIsProfileComplete(true)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isProfileComplete, refreshUser, clearUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
