import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { Seo } from '@/components/layout/Seo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FieldWrapper, Input, Select } from '@/components/ui/Field'
import { cn } from '@/lib/utils'
import { AuthPanel } from '@/features/find-my-polo/components/AuthPanel'
import { REWARD_TYPES, ROUTES } from '@/features/find-my-polo/config'
import { signOut, useAuthSession } from '@/features/find-my-polo/hooks/useAuthSession'
import { playSound } from '@/features/find-my-polo/hooks/useSound'
import { GameError, isGameConfigured } from '@/features/find-my-polo/services/supabase'
import * as staff from '@/features/find-my-polo/services/staffApi'
import type { AdminQr, AdminStats, ClaimLookup, EventInfo, StaffRole } from '@/features/find-my-polo/types'
import { errorText } from '@/features/find-my-polo/utils/errorText'
import { buildQrUrl } from '@/features/find-my-polo/utils/qrToken'

type Tab = 'redeem' | 'stats' | 'setup'

const card = 'rounded-md border border-line bg-white p-6'

/**
 * Panel panitia Find My Polo. Otorisasi sepenuhnya di database (tabel game_staff). Login admin demo
 * di AdminLayout hanya sesi mock di localStorage dan TIDAK bisa dipercaya server, jadi panel ini
 * meminta login Supabase sendiri.
 */
export default function PoloAdmin() {
  const { t } = useTranslation()
  const auth = useAuthSession()
  const [role, setRole] = useState<StaffRole | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.verified) {
      setRole(undefined)
      return
    }
    let active = true
    staff
      .getStaffRole()
      .then((r) => active && setRole(r))
      .catch((e) => {
        if (!active) return
        setRole(null)
        setError(errorText(t, e instanceof GameError ? e.code : 'unknown'))
      })
    return () => {
      active = false
    }
  }, [auth.verified, auth.user?.id, t])

  let body: ReactNode
  if (!isGameConfigured) {
    body = <p className={cn(card, 'text-body text-muted')}>{t('polo.admin.unavailable')}</p>
  } else if (auth.loading) {
    body = <p className="text-body text-muted">{t('polo.loading')}</p>
  } else if (!auth.user) {
    body = (
      <div className={cn(card, 'max-w-md')}>
        <h2 className="text-title">{t('polo.admin.signInTitle')}</h2>
        <p className="mb-5 mt-2 text-body text-muted">{t('polo.admin.signInHint')}</p>
        <AuthPanel allowSignUp={false} redirectPath={ROUTES.admin} />
      </div>
    )
  } else if (!auth.verified) {
    body = <p className={cn(card, 'text-body text-muted')}>{t('polo.errors.email_not_verified')}</p>
  } else if (role === undefined) {
    body = <p className="text-body text-muted">{t('polo.loading')}</p>
  } else if (role === null) {
    body = (
      <div className={cn(card, 'max-w-md')}>
        <p className="text-body text-muted">{error ?? t('polo.admin.noRole')}</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => void signOut()}>
          {t('polo.admin.signOut')}
        </Button>
      </div>
    )
  } else {
    body = <Console role={role} />
  }

  return (
    <div className="flex flex-col gap-8">
      <Seo title={`${t('polo.admin.title')} — ${t('common.brand')}`} description={t('polo.admin.subtitle')} path={ROUTES.admin} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display-m">{t('polo.admin.title')}</h1>
          <p className="mt-1 text-body text-muted">{t('polo.admin.subtitle')}</p>
        </div>
        {role && (
          <div className="flex items-center gap-3">
            <Badge tone="accent">{t('polo.admin.role', { role })}</Badge>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              {t('polo.admin.signOut')}
            </Button>
          </div>
        )}
      </div>
      {body}
    </div>
  )
}

function Console({ role }: { role: StaffRole }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('redeem')
  const tabs: Tab[] = role === 'admin' ? ['redeem', 'stats', 'setup'] : ['redeem', 'stats']
  const label: Record<Tab, string> = {
    redeem: t('polo.admin.tabRedeem'),
    stats: t('polo.admin.tabStats'),
    setup: t('polo.admin.tabSetup'),
  }
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="inline-flex flex-wrap gap-1 self-start rounded-pill bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,.06)]">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-pill px-5 py-2 text-label transition-colors duration-200',
              tab === id ? 'bg-ink text-white' : 'text-muted hover:text-ink',
            )}
          >
            {label[id]}
          </button>
        ))}
      </div>
      {tab === 'redeem' && <RedeemTab isAdmin={role === 'admin'} />}
      {tab === 'stats' && <StatsTab />}
      {tab === 'setup' && role === 'admin' && <SetupTab />}
    </div>
  )
}

function useAction() {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      setBusy(true)
      setError(null)
      try {
        return await fn()
      } catch (e) {
        setError(errorText(t, e instanceof GameError ? e.code : 'unknown'))
        return undefined
      } finally {
        setBusy(false)
      }
    },
    [t],
  )
  return { busy, error, run, setError }
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="text-meta text-[#B23A3A]">
      {error}
    </p>
  ) : null
}

/* ————————————————— Tukar hadiah ————————————————— */

function RedeemTab({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useTranslation()
  const { busy, error, run } = useAction()
  const [code, setCode] = useState('')
  const [lookup, setLookup] = useState<ClaimLookup | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const rewardName = (type: string) => t(`polo.rewards.${type}.title`, { defaultValue: type })

  async function onLookup(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLookup(null)
    const res = await run(() => staff.lookupClaim(code))
    if (res) setLookup(res)
  }

  async function onRedeem() {
    const res = await run(() => staff.redeemReward(code))
    if (!res) return
    if (res.ok) {
      playSound('success')
      setMessage(t('polo.admin.redeemed', { reward: rewardName(res.reward_type) }))
      setLookup(null)
      setCode('')
    } else if (res.reason === 'already_redeemed') {
      const when = res.redeemed_at ? ` (${new Date(res.redeemed_at).toLocaleString()})` : ''
      setMessage(t('polo.admin.alreadyRedeemed', { when }))
    } else if (res.reason === 'cancelled') {
      setMessage(t('polo.admin.cancelled'))
    } else {
      setMessage(t('polo.admin.notFound'))
    }
  }

  async function onCancel() {
    const res = await run(() => staff.cancelClaim(code))
    if (!res) return
    setMessage(res.ok ? t('polo.admin.cancelDone') : t('polo.admin.cancelFail'))
    setLookup(null)
  }

  let state: ReactNode = null
  if (lookup) {
    if (!lookup.found) state = <p className="text-body">{t('polo.admin.notFound')}</p>
    else if (lookup.status === 'claimed')
      state = (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body">{t('polo.admin.readyToRedeem', { reward: rewardName(lookup.reward_type), event: lookup.event_name })}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm" disabled={busy} onClick={onRedeem}>
              {busy ? t('polo.admin.working') : t('polo.admin.redeemNow')}
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                {t('polo.admin.cancelClaim')}
              </Button>
            )}
          </div>
        </div>
      )
    else if (lookup.status === 'redeemed')
      state = (
        <p className="text-body">
          {t('polo.admin.alreadyRedeemed', { when: lookup.redeemed_at ? ` (${new Date(lookup.redeemed_at).toLocaleString()})` : '' })}
        </p>
      )
    else state = <p className="text-body">{t('polo.admin.cancelled')}</p>
  }

  return (
    <div className={cn(card, 'flex max-w-xl flex-col gap-5')}>
      <form onSubmit={onLookup} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label={t('polo.admin.codeLabel')} htmlFor="polo-claim-code">
          <Input
            id="polo-claim-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="font-mono tracking-[0.18em]"
            aria-describedby="polo-claim-help"
          />
          <p id="polo-claim-help" className="text-meta text-muted-2">
            {t('polo.admin.codeHelp')}
          </p>
        </FieldWrapper>
        <Button type="submit" variant="dark" size="sm" className="self-start" disabled={busy || code.trim().length < 4}>
          {t('polo.admin.lookup')}
        </Button>
      </form>
      <div aria-live="polite" className="flex flex-col gap-3">
        {state}
        {message && <p className="rounded-sm bg-surface p-3 text-body">{message}</p>}
        <ErrorLine error={error} />
      </div>
    </div>
  )
}

/* ————————————————— Statistik ————————————————— */

function StatsTab() {
  const { t } = useTranslation()
  const { busy, error, run } = useAction()
  const [stats, setStats] = useState<AdminStats | null>(null)

  const load = useCallback(async () => {
    const s = await run(() => staff.getStats())
    if (s) setStats(s)
  }, [run])
  useEffect(() => {
    void load()
  }, [load])

  const entries = (o: Record<string, number | undefined>) => Object.entries(o).filter(([, v]) => v !== undefined) as [string, number][]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={load} disabled={busy}>
          {t('polo.admin.refresh')}
        </Button>
        <ErrorLine error={error} />
      </div>
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t('polo.admin.statPlayers'), stats.players_started],
              [t('polo.admin.statCompleted'), stats.players_completed],
              [t('polo.admin.statStamps'), stats.total_stamps],
              [t('polo.admin.statActiveQrs'), stats.active_qrs],
            ].map(([label, value]) => (
              <div key={label as string} className={card}>
                <p className="text-meta text-muted">{label}</p>
                <p className="mt-1 text-display-m tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StatList title={t('polo.admin.statByStamps')} rows={entries(stats.by_stamp_count).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => [t('polo.admin.stampsN', { n: k }), v])} empty={t('polo.admin.none')} />
            <StatList
              title={t('polo.admin.statClaims')}
              rows={[
                [t('polo.admin.claimsClaimed'), stats.claims.claimed ?? 0],
                [t('polo.admin.claimsRedeemed'), stats.claims.redeemed ?? 0],
                [t('polo.admin.claimsCancelled'), stats.claims.cancelled ?? 0],
              ]}
              empty={t('polo.admin.none')}
            />
            <StatList title={t('polo.admin.statScans')} rows={entries(stats.scans_24h).map(([k, v]) => [k, v])} empty={t('polo.admin.none')} />
          </div>

          <div className={card}>
            <h2 className="text-title">{t('polo.admin.statInventory')}</h2>
            {stats.inventory.length === 0 ? (
              <p className="mt-2 text-body text-muted">{t('polo.admin.none')}</p>
            ) : (
              <table className="mt-3 w-full text-left text-body">
                <thead className="text-meta text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-medium" />
                    <th className="py-2 pr-4 font-medium">{t('polo.admin.invTotal')}</th>
                    <th className="py-2 pr-4 font-medium">{t('polo.admin.invReserved')}</th>
                    <th className="py-2 pr-4 font-medium">{t('polo.admin.invRedeemed')}</th>
                    <th className="py-2 font-medium">{t('polo.admin.invLeft')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.inventory.map((r) => (
                    <tr key={r.type} className="border-t border-line tabular-nums">
                      <td className="py-2 pr-4">{t(`polo.rewards.${r.type}.title`, { defaultValue: r.type })}</td>
                      <td className="py-2 pr-4">{r.total}</td>
                      <td className="py-2 pr-4">{r.reserved}</td>
                      <td className="py-2 pr-4">{r.redeemed}</td>
                      <td className="py-2">{r.total - r.reserved - r.redeemed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatList({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  return (
    <div className={card}>
      <h2 className="text-title">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-body text-muted">{empty}</p>
      ) : (
        <dl className="mt-3 flex flex-col">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between border-t border-line py-2 text-body tabular-nums first:border-t-0">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* ————————————————— QR & stok ————————————————— */

function SetupTab() {
  const { t } = useTranslation()
  const { busy, error, run } = useAction()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [qrs, setQrs] = useState<AdminQr[]>([])
  const [eventStatus, setEventStatus] = useState<EventInfo['status']>('draft')
  const [stock, setStock] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [sheet, setSheet] = useState<{ label: number; url: string; dataUrl: string; path: string }[] | null>(null)

  const load = useCallback(async () => {
    const [s, q] = await Promise.all([run(() => staff.getStats()), run(() => staff.listQrs())])
    if (s) {
      setStats(s)
      setEventStatus(s.event.status)
      setStock(Object.fromEntries(s.inventory.map((i) => [i.type, String(i.total)])))
    }
    if (q) setQrs(q)
  }, [run])
  useEffect(() => {
    void load()
  }, [load])

  // Token tidak pernah disimpan: hilang saat tab ditutup atau tombol "Sembunyikan" ditekan.
  useEffect(() => () => setSheet(null), [])

  async function apply(fn: () => Promise<unknown>) {
    setSaved(null)
    if ((await run(fn)) !== undefined) {
      setSaved(t('polo.admin.saved'))
      await load()
    }
  }

  async function generate() {
    const rotated = await run(() => staff.rotateTokens(stats?.event.status === 'active'))
    if (!rotated) return
    const items = await Promise.all(
      rotated.map(async (r) => {
        const url = buildQrUrl(window.location.origin, r.token)
        return { label: r.label, url, path: r.destination_path, dataUrl: await QRCode.toDataURL(url, { margin: 1, width: 240 }) }
      }),
    )
    setSheet(items)
    setConfirm(false)
    await load()
  }

  const statusLabel: Record<AdminQr['status'], string> = {
    active: t('polo.admin.qrStatusActive'),
    disabled: t('polo.admin.qrStatusDisabled'),
    revoked: t('polo.admin.qrStatusRevoked'),
  }

  return (
    <div className="flex flex-col gap-6">
      <ErrorLine error={error} />
      {saved && (
        <p role="status" className="text-meta text-accent-ink">
          {saved}
        </p>
      )}

      <div className={cn(card, 'flex max-w-xl flex-col gap-3')}>
        <FieldWrapper label={t('polo.admin.eventStatus')} htmlFor="polo-event-status">
          <Select id="polo-event-status" value={eventStatus} onChange={(e) => setEventStatus(e.target.value as EventInfo['status'])}>
            <option value="draft">{t('polo.admin.eventStatusDraft')}</option>
            <option value="active">{t('polo.admin.eventStatusActive')}</option>
            <option value="ended">{t('polo.admin.eventStatusEnded')}</option>
            <option value="archived">{t('polo.admin.eventStatusArchived')}</option>
          </Select>
        </FieldWrapper>
        <Button variant="dark" size="sm" className="self-start" disabled={busy} onClick={() => apply(() => staff.setEventStatus(eventStatus))}>
          {t('polo.admin.eventApply')}
        </Button>
        <p className="text-meta text-muted-2">{t('polo.admin.eventNote')}</p>
      </div>

      <div className={cn(card, 'flex max-w-xl flex-col gap-4')}>
        <h2 className="text-title">{t('polo.admin.inventoryTitle')}</h2>
        <p className="text-meta text-muted-2">{t('polo.admin.inventoryHelp')}</p>
        {REWARD_TYPES.map((type) => (
          <div key={type} className="flex items-end gap-3">
            <FieldWrapper label={t(`polo.rewards.${type}.title`)} htmlFor={`polo-stock-${type}`} className="flex-1">
              <Input
                id={`polo-stock-${type}`}
                type="number"
                inputMode="numeric"
                min={0}
                value={stock[type] ?? ''}
                onChange={(e) => setStock((s) => ({ ...s, [type]: e.target.value }))}
              />
            </FieldWrapper>
            <Button
              variant="dark"
              size="sm"
              disabled={busy || stock[type] === undefined || stock[type] === '' || Number(stock[type]) < 0}
              onClick={() => apply(() => staff.setInventory(type, Math.floor(Number(stock[type]))))}
            >
              {t('polo.admin.inventorySave')}
            </Button>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="text-title">{t('polo.admin.qrTitle')}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-body">
            <thead className="text-meta text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">{t('polo.admin.qrLabel')}</th>
                <th className="py-2 pr-4 font-medium">{t('polo.admin.qrStatus')}</th>
                <th className="py-2 pr-4 font-medium">{t('polo.admin.qrDestination')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {qrs.map((q) => (
                <tr key={q.label} className="border-t border-line">
                  <td className="py-2 pr-4 tabular-nums">{q.label}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={q.status === 'active' ? 'accent' : 'neutral'}>{statusLabel[q.status]}</Badge>
                  </td>
                  <td className="py-2 pr-4 font-mono text-meta">{q.destination_path}</td>
                  <td className="flex gap-2 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => apply(() => staff.setQrStatus(q.label, q.status === 'active' ? 'disabled' : 'active'))}
                    >
                      {q.status === 'active' ? t('polo.admin.qrDisable') : t('polo.admin.qrEnable')}
                    </Button>
                    {q.status !== 'revoked' && (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => apply(() => staff.setQrStatus(q.label, 'revoked'))}>
                        {t('polo.admin.qrRevoke')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cn(card, 'flex flex-col gap-4')}>
        <h2 className="text-title">{t('polo.admin.tokensTitle')}</h2>
        <p className="max-w-2xl text-body text-muted">{t('polo.admin.tokensBody')}</p>
        <label className="flex items-center gap-2 text-body">
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="h-4 w-4" />
          {t('polo.admin.tokensConfirm')}
        </label>
        <Button variant="dark" size="sm" className="self-start" disabled={busy || !confirm} onClick={generate}>
          {busy ? t('polo.admin.working') : t('polo.admin.tokensGenerate')}
        </Button>

        {sheet && (
          <div className="flex flex-col gap-4">
            <p className="rounded-sm bg-[#FFF6E0] p-3 text-meta text-[#7A5A00]">{t('polo.admin.tokensWarn')}</p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.print()}>
                {t('polo.admin.tokensPrint')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSheet(null)}>
                {t('polo.admin.tokensClear')}
              </Button>
            </div>
            <style>{`@media print { body * { visibility: hidden } #polo-print, #polo-print * { visibility: visible } #polo-print { position: absolute; left: 0; top: 0; width: 100% } }`}</style>
            <div id="polo-print" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {sheet.map((s) => (
                <figure key={s.label} className="flex break-inside-avoid flex-col items-center gap-2 text-center">
                  <img src={s.dataUrl} alt={`${t('polo.admin.qrLabel')} ${s.label}`} className="h-40 w-40" />
                  <figcaption className="text-label">
                    {t('polo.admin.qrLabel')} {s.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
