import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken } from '../services/auth'
import { useAuth } from '../stores/authStore'

export default function RequireAuth() {
  const location = useLocation()
  const token = getToken()
  const { isLoading } = useAuth()

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (isLoading) {
    return null
  }

  return <Outlet />
}
