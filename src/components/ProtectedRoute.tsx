import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router'

export function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated])

  return children
}
