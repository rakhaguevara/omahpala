import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

type CameraState = 'starting' | 'ready' | 'denied' | 'nocamera' | 'error'

interface QrScannerViewProps {
  onDecode: (text: string) => void
  /** true saat hasil scan sedang diproses: hasil decode baru diabaikan. */
  paused: boolean
}

/**
 * Pemindai kamera. Pustaka qr-scanner dimuat dinamis supaya tidak membebani halaman lain.
 * Izin ditolak / tanpa kamera / gagal buka → pesan jelas + tombol coba lagi (pemulihan manual
 * ada di ScanPage). Kamera selalu dimatikan saat komponen dilepas.
 */
export function QrScannerView({ onDecode, paused }: QrScannerViewProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const pausedRef = useRef(paused)
  const onDecodeRef = useRef(onDecode)
  const [state, setState] = useState<CameraState>('starting')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    pausedRef.current = paused
    onDecodeRef.current = onDecode
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let cancelled = false
    let scanner: { start(): Promise<void>; stop(): void; destroy(): void } | null = null
    setState('starting')

    void (async () => {
      try {
        const { default: QrScanner } = await import('qr-scanner')
        if (cancelled) return
        if (!(await QrScanner.hasCamera())) {
          if (!cancelled) setState('nocamera')
          return
        }
        scanner = new QrScanner(
          video,
          (result) => {
            if (!pausedRef.current) onDecodeRef.current(result.data)
          },
          {
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        )
        await scanner.start()
        if (cancelled) {
          scanner.destroy()
          return
        }
        setState('ready')
      } catch (e) {
        if (cancelled) return
        const text = String((e as { name?: string; message?: string })?.name ?? '') + String((e as Error)?.message ?? e)
        if (/NotAllowed|PermissionDenied|denied/i.test(text)) setState('denied')
        else if (/NotFound|Camera not found|DevicesNotFound/i.test(text)) setState('nocamera')
        else setState('error')
      }
    })()

    return () => {
      cancelled = true
      scanner?.destroy()
    }
  }, [attempt])

  const message =
    state === 'starting' ? t('polo.scan.starting')
    : state === 'ready' ? t('polo.scan.ready')
    : state === 'denied' ? t('polo.scan.denied')
    : state === 'nocamera' ? t('polo.scan.noCamera')
    : t('polo.scan.cameraError')

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-ink">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted aria-label={t('polo.scan.title')} />
      </div>
      <p role="status" className="text-meta text-muted">
        {message}
      </p>
      {(state === 'denied' || state === 'error' || state === 'nocamera') && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAttempt((n) => n + 1)}>
          {t('polo.scan.retry')}
        </Button>
      )}
    </div>
  )
}
