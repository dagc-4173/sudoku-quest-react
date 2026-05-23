import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

function PrivateRoute({ children }: PrivateRouteProps) {
  return <>{children}</>
}

export default PrivateRoute
