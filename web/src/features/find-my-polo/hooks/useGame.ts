import { useCallback, useEffect, useRef, useState } from 'react'
import { GameError, type GameErrorCode } from '../services/supabase'
import { getProgress, startGame } from '../services/gameApi'
import type { Progress, StartedProgress } from '../types'
import { useAuthSession } from './useAuthSession'

type Phase = 'loading' | 'ready' | 'error'

/**
 * Status permainan pemain yang sedang login. Semua angka berasal dari server; hook ini hanya
 * menyimpan salinan terakhir untuk ditampilkan.
 */
export function useGame() {
  const auth = useAuthSession()
  const [progress, setProgress] = useState<Progress | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState<GameErrorCode | null>(null)
  const [starting, setStarting] = useState(false)
  const seq = useRef(0)

  const refresh = useCallback(async () => {
    const mine = ++seq.current
    setPhase('loading')
    try {
      const p = await getProgress()
      if (mine !== seq.current) return
      setProgress(p)
      setError(null)
      setPhase('ready')
    } catch (e) {
      if (mine !== seq.current) return
      setError(e instanceof GameError ? e.code : 'unknown')
      setPhase('error')
    }
  }, [])

  const signedIn = Boolean(auth.user)
  useEffect(() => {
    if (auth.loading) return
    if (!signedIn) {
      seq.current++
      setProgress(null)
      setError(null)
      setPhase('ready')
      return
    }
    void refresh()
  }, [auth.loading, signedIn, auth.user?.id, refresh])

  const start = useCallback(async () => {
    setStarting(true)
    try {
      const p = await startGame()
      setProgress(p)
      setError(null)
      setPhase('ready')
      return p
    } catch (e) {
      setError(e instanceof GameError ? e.code : 'unknown')
      return null
    } finally {
      setStarting(false)
    }
  }, [])

  /** Ganti salinan progres dengan hasil RPC (scan, klaim, challenge). */
  const apply = useCallback((p: StartedProgress) => {
    setProgress(p)
    setError(null)
    setPhase('ready')
  }, [])

  return {
    auth,
    progress,
    started: progress?.started === true ? progress : null,
    loading: auth.loading || (signedIn && phase === 'loading' && progress === null),
    error,
    starting,
    refresh,
    start,
    apply,
  }
}
