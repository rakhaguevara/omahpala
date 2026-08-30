// Auth admin sementara — TIDAK aman untuk produksi.
// Kredensial hardcoded + sesi di localStorage, khusus demo Tahap 1–2.
// PRD §10 & §11 menetapkan Auth.js + hash password untuk Tahap 3 (backend nyata).

import type { AdminRole, AdminUser } from '@/types'

const SESSION_KEY = 'omahpala_admin_session'

interface Credential {
  email: string
  password: string
  user: AdminUser
}

const CREDENTIALS: Credential[] = [
  {
    email: 'admin@omahpala.id',
    password: 'omahpala2025',
    user: { id: 'u-1', email: 'admin@omahpala.id', name: 'Admin PPKO', role: 'admin' },
  },
  {
    email: 'pengurus@omahpala.id',
    password: 'togaberdaya',
    user: {
      id: 'u-2',
      email: 'pengurus@omahpala.id',
      name: 'Pengurus TOGA Berdaya',
      role: 'pengurus',
    },
  },
]

export function login(email: string, password: string): AdminUser | null {
  const match = CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password,
  )
  if (!match) return null
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(match.user))
  return match.user
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY)
}

export function getSession(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function can(role: AdminRole, area: 'produk' | 'pesanan' | 'kebun' | 'konten'): boolean {
  if (role === 'admin') return true
  // pengurus: produk & pesanan saja — PRD §7.6 A-02
  return area === 'produk' || area === 'pesanan'
}
