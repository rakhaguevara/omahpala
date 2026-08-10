import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getSession, login } from '@/lib/auth'
import { FieldWrapper, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/layout/Seo'

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (getSession()) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'
    return <Navigate to={redirectTo} replace />
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const user = login(email, password)
    if (!user) {
      setError(t('admin.loginError'))
      return
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Seo title={`${t('admin.loginTitle')} — ${t('common.brand')}`} description={t('admin.loginSubtitle')} path="/admin/login" />
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-[0_16px_50px_rgba(0,0,0,.08)]">
        <div className="mb-6 flex flex-col gap-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
            OP
          </span>
          <h1 className="mt-3 text-title">{t('admin.loginTitle')}</h1>
          <p className="text-body text-muted">{t('admin.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldWrapper label={t('admin.loginEmail')} htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label={t('admin.loginPassword')} htmlFor="password" required error={error ?? undefined}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldWrapper>
          <Button type="submit" variant="dark" className="w-full">
            {t('admin.loginSubmit')}
          </Button>
        </form>

        <p className="mt-6 text-meta text-muted-2">{t('admin.loginHint')}</p>
      </div>
    </div>
  )
}
