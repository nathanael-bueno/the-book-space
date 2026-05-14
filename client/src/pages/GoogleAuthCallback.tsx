import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../services/auth'
import { getMyProfile } from '../services/profile'

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    async function finishGoogleLogin() {
      const token = searchParams.get('token')

      if (!token) {
        navigate('/auth/login?error=Falha ao concluir login com Google.', {
          replace: true,
        })
        return
      }

      setToken(token)

      try {
        const profileResponse = await getMyProfile()
        const profile = profileResponse.data
        const needsCompletion =
          !profile.cidade || !profile.estado || !profile.faixa_etaria

        if (needsCompletion) {
          navigate('/auth/complete-profile', { replace: true })
          return
        }
      } catch {
        navigate('/auth/login?error=Falha ao carregar perfil apos login.', {
          replace: true,
        })
        return
      }

      navigate('/app/feed', { replace: true })
    }

    void finishGoogleLogin()
  }, [navigate, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfbf9] p-6">
      <div className="ui-auth-card w-full max-w-sm p-8 text-center">
        <p className="text-sm font-medium text-neutral-700">
          Conectando sua conta...
        </p>
      </div>
    </div>
  )
}
