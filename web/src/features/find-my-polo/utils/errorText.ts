import type { TFunction } from 'i18next'
import type { GameErrorCode } from '../services/supabase'

/** Pesan pengguna untuk kode error server. Kode tak dikenal jatuh ke pesan generik. */
export function errorText(t: TFunction, code: GameErrorCode): string {
  return t(`polo.errors.${code}`, { defaultValue: t('polo.errors.unknown') })
}
