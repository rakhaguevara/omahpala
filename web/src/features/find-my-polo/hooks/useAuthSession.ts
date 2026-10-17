import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthState {
  session: Session | null
  loading: boolean
}

/** Sesi Supabase Auth. `verified` dibaca dari email_confirmed_at; server memeriksa ulang di setiap RPC. */
export function useAuthSession() {
  const [state, setState] = useState<AuthState>({ session: null, loading: Boolean(supabase) })

  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, loading: false })
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, loading: false })
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const user: User | null = state.session?.user ?? null
  return {
    session: state.session,
    user,
    loading: state.loading,
    verified: Boolean(user?.email_confirmed_at),
  }
}

export async function signOut() {
  await supabase?.auth.signOut()
}
