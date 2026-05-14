import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../services/http'
import {
  login,
  loginStart,
  loginWithCode,
  resendEmailCodeByEmail,
  startGoogleLogin,
} from '../services/auth'
import { useToast } from '../stores/useToast'

export type LoginMethod = 'email' | 'password' | 'google_code'

type UseLoginFlowOptions = {
  initialErrorMessage?: string
}

export function useLoginFlow({
  initialErrorMessage = '',
}: UseLoginFlowOptions) {
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return

    const intervalId = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [resendCooldown])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      if (loginMethod === 'email') {
        const response = await loginStart(email.trim())
        setEmail(response.email)
        setPassword('')
        setCode('')
        setLoginMethod(response.method)

        if (response.method === 'google_code') {
          setResendCooldown(30)
        }

        return
      }

      if (loginMethod === 'google_code') {
        await loginWithCode({ email: email.trim(), code: code.trim() })
        navigate('/app/feed')
        return
      }

      await login({ email, senha: password })
      navigate('/app/feed')
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 403 &&
        email.trim().length > 0
      ) {
        try {
          await resendEmailCodeByEmail(email.trim())
        } catch {
          // If resend fails, still continue to verification screen.
        }

        localStorage.setItem(
          'book-space.pending-verification-email',
          email.trim()
        )
        navigate('/auth/verify-email', {
          replace: true,
          state: { email: email.trim() },
        })
        return
      }

      setErrorMessage(
        error instanceof ApiError ? error.message : 'Não foi possível entrar.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setLoginMethod('email')
    setPassword('')
    setCode('')
    setResendCooldown(0)
    setErrorMessage('')
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return

    setIsLoading(true)
    setErrorMessage('')
    try {
      await loginStart(email.trim())
      setResendCooldown(30)
      toast.success({
        title: 'Codigo reenviado',
        message: 'Verifique seu e-mail para continuar o login.',
      })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel reenviar o codigo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = () => {
    startGoogleLogin()
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    isLoading,
    errorMessage,
    loginMethod,
    resendCooldown,
    handleSubmit,
    handleChangeEmail,
    handleResendCode,
    handleSocialLogin,
  }
}
