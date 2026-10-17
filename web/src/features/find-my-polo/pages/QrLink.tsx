import { Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '../config'

/**
 * Tujuan tautan di QR fisik (/find-my-polo/q/:token). Hanya memindahkan token ke router state
 * lalu menyerahkan ke ScanPage, yang menangani login, Start Hunting, dan pengiriman ke server.
 * Token tidak divalidasi di sini — validasi sepenuhnya di server.
 */
export default function QrLink() {
  const { token } = useParams<{ token: string }>()
  return <Navigate to={ROUTES.scan} replace state={{ token }} />
}
