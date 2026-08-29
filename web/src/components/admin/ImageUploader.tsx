import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { IconClose } from '@/components/ui/Icons'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
}

/**
 * Unggah gambar dari HP — PRD A-04 & A-09.
 * Karena belum ada storage backend (lihat README), file dikonversi ke base64 data URL
 * dan disimpan langsung di localStorage. Cukup untuk demo, TIDAK cocok untuk produksi
 * (data URL besar akan membengkakkan localStorage) — ganti ke UploadThing/Cloudinary di Tahap 3.
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange([...images, reader.result])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-sm border border-line">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              aria-label={t('admin.productDelete')}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
            >
              <IconClose className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="self-start">
        + {t('admin.uploadPhoto')}
      </Button>
    </div>
  )
}

interface PhotoUploaderProps {
  photo: string
  onChange: (photo: string) => void
}

/** Versi satu-foto dari ImageUploader — dipakai untuk field `photo` tunggal (lahan, penanam). */
export function PhotoUploader({ photo, onChange }: PhotoUploaderProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-3">
      {photo ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-line">
          <img src={photo} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t('admin.removePhoto')}
            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
          >
            <IconClose className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border border-dashed border-line text-meta text-muted-2">
          —
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
        + {t('admin.uploadPhoto')}
      </Button>
    </div>
  )
}
