import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

interface PrivateRouteProps {
  children: ReactNode
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation()
  const { currentUser, isConfigured, isLoading } = useAuth()

  if (!isConfigured) {
    return <>{children}</>
  }

  if (isLoading) {
    return <div className="route-loader">Validando sesión...</div>
  }

  if (!currentUser) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <>{children}</>
}

export default PrivateRoute
