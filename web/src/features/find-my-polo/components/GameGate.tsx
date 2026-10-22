import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { AuthPanel } from './AuthPanel'
import { getPublicEvent } from '../services/gameApi'
import { isGameConfigured } from '../services/supabase'
import { playSound } from '../hooks/useSound'
import type { useGame } from '../hooks/useGame'
import type { StartedProgress } from '../types'
import { errorText } from '../utils/errorText'

type Game = ReturnType<typeof useGame>

interface GameGateProps {
  game: Game
  /** Teks tambahan di atas form login (mis. di halaman scan). */
  loginNote?: string
  startNote?: string
  children: (progress: StartedProgress) => ReactNode
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-[0_16px_50px_rgba(0,0,0,.08)]">{children}</div>
  )
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h2 className="text-title">{title}</h2>
      <p className="mt-2 text-body text-muted">{body}</p>
    </Card>
  )
}

/**
 * Menyaring semua keadaan sebelum permainan bisa dimainkan: belum dikonfigurasi, memuat, belum
 * login, email belum terverifikasi, event belum dibuka, belum menekan Start Hunting.
 * Hanya bila semuanya lolos, `children` dirender dengan progres dari server.
 */
function GameGateInner({ game, loginNote, startNote, children }: GameGateProps) {
  const { t } = useTranslation()
  const { auth } = game
  const [publicOpen, setPublicOpen] = useState<boolean | null>(null)

  // Pengunjung yang belum login: cek apakah event memang terbuka sebelum mengajak mendaftar.
  const needsPublicCheck = isGameConfigured && !auth.loading && !auth.user
  useEffect(() => {
    if (!needsPublicCheck) return
    let active = true
    void getPublicEvent().then((ev) => {
      if (!active) return
      const now = Date.now()
      setPublicOpen(
        Boolean(
          ev &&
            ev.status === 'active' &&
            (!ev.starts_at || now >= Date.parse(ev.starts_at)) &&
            (!ev.ends_at || now < Date.parse(ev.ends_at)),
        ),
      )
    })
    return () => {
      active = false
    }
  }, [needsPublicCheck])

  if (!isGameConfigured) {
    return <Notice title={t('polo.unavailableTitle')} body={t('polo.unavailableBody')} />
  }
  if (auth.loading || game.loading) {
    return (
      <p role="status" className="text-center text-body text-muted">
        {t('polo.loading')}
      </p>
    )
  }

  if (!auth.user) {
    if (publicOpen === null) {
      return (
        <p role="status" className="text-center text-body text-muted">
          {t('polo.loading')}
        </p>
      )
    }
    if (!publicOpen) return <Notice title={t('polo.notOpenTitle')} body={t('polo.notOpenBody')} />
    return (
      <Card>
        {loginNote && <p className="mb-5 text-body text-muted">{loginNote}</p>}
        <AuthPanel />
      </Card>
    )
  }

  if (game.error === 'event_not_found') {
    return <Notice title={t('polo.notOpenTitle')} body={t('polo.notOpenBody')} />
  }
  if (game.error && !game.progress) {
    return (
      <Card>
        <p role="alert" className="text-body text-[#B23A3A]">
          {errorText(t, game.error)}
        </p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => void game.refresh()}>
          {t('polo.challenge.retry')}
        </Button>
      </Card>
    )
  }

  if (!game.started) {
    const open = game.progress?.event.is_open ?? false
    if (!open) return <Notice title={t('polo.notOpenTitle')} body={t('polo.notOpenBody')} />
    return (
      <Card>
        {startNote && <p className="mb-4 text-body text-muted">{startNote}</p>}
        <p className="text-body text-muted">{t('polo.startHint')}</p>
        <Button
          variant="primary"
          className="mt-5 w-full"
          disabled={game.starting}
          onClick={() => {
            playSound('start')
            void game.start()
          }}
        >
          {game.starting ? t('polo.starting') : t('polo.start')}
        </Button>
        {game.error && (
          <p role="alert" className="mt-3 text-meta text-[#B23A3A]">
            {errorText(t, game.error)}
          </p>
        )}
      </Card>
    )
  }

  return <>{children(game.started)}</>
}

export function GameGate(props: GameGateProps) {
  return <GameGateInner {...props} />
}
