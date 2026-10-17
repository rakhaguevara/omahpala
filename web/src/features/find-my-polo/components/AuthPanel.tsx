import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { FieldWrapper, Input } from '@/components/ui/Field'
import { requireClient } from '../services/supabase'
import { ROUTES } from '../config'

type Mode = 'signUp' | 'signIn'

interface AuthPanelProps {
  /** Admin/panitia tidak boleh mendaftar sendiri dari panel. */
  allowSignUp?: boolean
  /** Ke mana tautan verifikasi email mengarah. */
  redirectPath?: string
  initialMode?: Mode
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Daftar / masuk dengan Supabase Auth. Pesan error sengaja generik (tidak membedakan
 * "email tidak ada" vs "sandi salah") agar tidak membocorkan akun yang terdaftar.
 */
export function AuthPanel({ allowSignUp = true, redirectPath = ROUTES.home, initialMode = 'signUp' }: AuthPanelProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>(allowSignUp ? initialMode : 'signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState<'sent' | 'unconfirmed' | null>(null)
  const [resent, setResent] = useState(false)

  function mapAuthError(message: string, status?: number): string {
    if (/not confirmed/i.test(message)) return t('polo.auth.errNotConfirmed')
    if (status === 429 || /rate limit|too many/i.test(message)) return t('polo.auth.errRate')
    if (/password/i.test(message) && /(short|least|weak|characters)/i.test(message)) return t('polo.auth.errWeak')
    if (/invalid login|invalid credentials/i.test(message)) return t('polo.auth.errInvalid')
    return t('polo.auth.errGeneric')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setResent(false)
    if (!EMAIL_RE.test(email.trim())) return setError(t('polo.auth.errEmail'))
    if (mode === 'signUp' && password.length < 8) return setError(t('polo.auth.errWeak'))

    setBusy(true)
    try {
      const client = requireClient()
      if (mode === 'signUp') {
        const { data, error: err } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
        })
        if (err) return setError(mapAuthError(err.message, err.status))
        // Dengan verifikasi email aktif, signUp tidak mengembalikan sesi.
        if (!data.session) setNeedsVerify('sent')
      } else {
        const { error: err } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (err) {
          const msg = mapAuthError(err.message, err.status)
          if (/not confirmed/i.test(err.message)) setNeedsVerify('unconfirmed')
          return setError(msg)
        }
      }
    } catch {
      setError(t('polo.errors.network'))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    try {
      const { error: err } = await requireClient().auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
      })
      if (err) setError(mapAuthError(err.message, err.status))
      else setResent(true)
    } catch {
      setError(t('polo.errors.network'))
    } finally {
      setBusy(false)
    }
  }

  if (needsVerify === 'sent') {
    return (
      <div className="flex flex-col gap-4" role="status">
        <h2 className="text-title">{t('polo.auth.checkEmailTitle')}</h2>
        <p className="text-body text-muted">{t('polo.auth.checkEmailBody', { email: email.trim() })}</p>
        <Button variant="ghost" size="sm" onClick={resend} disabled={busy} className="self-start">
          {t('polo.auth.resend')}
        </Button>
        {resent && <p className="text-meta text-accent-ink">{t('polo.auth.resent')}</p>}
        {error && (
          <p role="alert" className="text-meta text-[#B23A3A]">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {allowSignUp && (
        <div role="tablist" className="inline-flex self-start rounded-pill bg-surface p-1">
          {(['signUp', 'signIn'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setError(null)
                setNeedsVerify(null)
              }}
              className={cn(
                'rounded-pill px-5 py-2 text-label transition-colors duration-200',
                mode === m ? 'bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,.06)]' : 'text-muted hover:text-ink',
              )}
            >
              {t(m === 'signUp' ? 'polo.auth.signUpTab' : 'polo.auth.signInTab')}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FieldWrapper label={t('polo.auth.email')} htmlFor="polo-email" required>
          <Input
            id="polo-email"
            type="email"
            inputMode="email"
            autoComplete={mode === 'signUp' ? 'email' : 'username'}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('polo.auth.password')} htmlFor="polo-password" required error={error ?? undefined}>
          <Input
            id="polo-password"
            type="password"
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            required
            minLength={mode === 'signUp' ? 8 : undefined}
            aria-describedby={mode === 'signUp' ? 'polo-password-hint' : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signUp' && (
            <p id="polo-password-hint" className="text-meta text-muted-2">
              {t('polo.auth.passwordHint')}
            </p>
          )}
        </FieldWrapper>
        <Button type="submit" variant="dark" disabled={busy} className="w-full">
          {busy ? t('polo.auth.working') : t(mode === 'signUp' ? 'polo.auth.signUp' : 'polo.auth.signIn')}
        </Button>
        {needsVerify === 'unconfirmed' && (
          <div className="flex flex-col items-start gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={resend} disabled={busy}>
              {t('polo.auth.resend')}
            </Button>
            {resent && <p className="text-meta text-accent-ink">{t('polo.auth.resent')}</p>}
          </div>
        )}
      </form>
    </div>
  )
}
