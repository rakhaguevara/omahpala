import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '../config'
import { readChallenge } from '../utils/challengeStore'

// Dimuat malas: pengunjung biasa tidak mengunduh kode Supabase/tantangan. Gate ini sendiri hanya
// membaca sessionStorage, jadi biayanya nol bila tidak ada tantangan berjalan.
const ChallengeBar = lazy(() => import('./ChallengeBar'))

/**
 * Dipasang sekali di PublicLayout. Muncul di halaman publik mana pun saat ada tantangan scroll
 * tertunda; halaman Find My Polo sendiri menampilkan statusnya sendiri, jadi bar disembunyikan di sana.
 */
export function ChallengeGate() {
  const { pathname } = useLocation()
  if (pathname.startsWith(ROUTES.home)) return null
  const challenge = readChallenge()
  if (!challenge) return null
  return (
    <Suspense fallback={null}>
      <ChallengeBar key={challenge.id} challenge={challenge} />
    </Suspense>
  )
}
