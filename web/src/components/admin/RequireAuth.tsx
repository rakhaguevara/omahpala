import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '@/lib/auth'
import type { AdminUser } from '@/types'

/** Pelindung rute admin — PRD §7.6 A-01. Sesi mock di localStorage, bukan middleware server. */
export function RequireAuth({ children }: { children: (user: AdminUser) => ReactNode }) {
  const location = useLocation()
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined)

  useEffect(() => {
    setUser(getSession())
  }, [])

  if (user === undefined) return null
  if (user === null) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children(user)}</>
}
