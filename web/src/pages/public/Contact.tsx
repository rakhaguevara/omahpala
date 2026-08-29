import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Button, ExternalLinkButton } from '@/components/ui/Button'
import { FieldWrapper, Input, Select, Textarea } from '@/components/ui/Field'
import {
  IconFacebook,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconSparkle,
  IconTiktok,
  IconWhatsapp,
  IconYoutube,
} from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Seo } from '@/components/layout/Seo'
import { useInquiries, useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { waLink } from '@/lib/utils'
import { contactImages } from '@/lib/images'
import type { Inquiry } from '@/types'

const RATE_LIMIT_KEY = 'omahpala_last_inquiry_at'
const RATE_LIMIT_MS = 30_000

interface FormState {
  name: string
  company: string
  country: string
  email: string
  phone: string
  productId: string
  volume: string
  message: string
  website: string // honeypot
}

const emptyForm: FormState = {
  name: '',
  company: '',
  country: '',
  email: '',
  phone: '',
  productId: '',
  volume: '',
  message: '',
  website: '',
}

/** Kontak + form inquiry ekspor — PRD §7.5 C-01..C-05. */
export default function Contact() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const { add } = useInquiries()
  const { items: products } = useProducts()
  const [params] = useSearchParams()
  const preselected = params.get('produk') ?? ''

  const [form, setForm] = useState<FormState>({ ...emptyForm, productId: preselected })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  function validate(values: FormState): Partial<Record<keyof FormState, string>> {
    const next: Partial<Record<keyof FormState, string>> = {}
    // Perusahaan sengaja TIDAK wajib — UX-WRITING.md §6 "Form": tandai yang opsional, bukan
    // yang wajib, karena mayoritas kolom di form ini memang wajib diisi.
    const required: (keyof FormState)[] = ['name', 'country', 'email', 'message']
    for (const field of required) {
      if (!values[field].trim()) next[field] = t('contact.errorRequired')
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = t('contact.errorEmail')
    }
    return next
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    // Proteksi spam sisi klien — PRD C-02. Honeypot + rate limit sederhana
    // (rate limit "sungguhan" perlu server; ini hanya mencegah double-submit cepat).
    const lastSubmit = Number(window.localStorage.getItem(RATE_LIMIT_KEY) ?? 0)
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      setRateLimited(true)
      return
    }
    setRateLimited(false)

    setSubmitting(true)
    const isBot = form.website.trim().length > 0

    const inquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim(),
      country: form.country.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      productId: form.productId || null,
      volume: form.volume.trim(),
      message: form.message.trim(),
      locale,
      status: 'baru',
      internalNote: '',
      createdAt: new Date().toISOString(),
    }

    // Simulasi latensi kirim + notifikasi (PRD C-03: email admin + simpan DB — di sini localStorage).
    await new Promise((r) => setTimeout(r, 500))
    if (!isBot) {
      add(inquiry)
      window.localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()))
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  function resetForm() {
    setForm({ ...emptyForm })
    setErrors({})
    setSubmitted(false)
  }

  return (
    <>
      <Seo title={`${t('contact.title')} — ${t('common.brand')}`} description={t('contact.subtitle')} path="/kontak" />

      {/* Banner — foto full-bleed + overlay gradient standar design.md §2, bukan hero 100vh
          Beranda. Navbar mengambang tetap di atasnya seperti pola Hero.tsx. Mark kecil pojok
          kiri atas + breadcrumb pojok kanan bawah — persis referensi. */}
      <section className="relative flex h-[360px] items-end overflow-hidden bg-ink sm:h-[420px]">
        <img
          src={contactImages.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(33,33,33,.55) 0%, rgba(33,33,33,.75) 100%)' }}
          aria-hidden
        />
        {/* Transisi ke section putih berikutnya — glow putih lembut di tepi bawah, sama seperti Hero.tsx */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white sm:h-24 lg:h-28"
        />

        <Container className="absolute inset-x-0 top-6 z-10 sm:top-8">
          <IconSparkle className="h-5 w-5 text-white" aria-hidden />
        </Container>

        <Container className="absolute inset-x-0 bottom-4 z-10 sm:bottom-6">
          <div className="ml-auto flex w-fit items-center gap-1.5 rounded-pill bg-white/90 px-3 py-1.5 text-meta text-ink shadow-[0_2px_8px_rgba(0,0,0,.12)] backdrop-blur-sm">
            <Link to="/" className="hover:text-muted">
              {t('nav.home')}
            </Link>
            <span className="text-muted-2">/</span>
            <span>{t('nav.contact')}</span>
          </div>
        </Container>

        <Container className="relative z-10 pb-14 sm:pb-16">
          <Reveal className="flex flex-col gap-4">
            <Eyebrow tone="white">{t('contact.eyebrow')}</Eyebrow>
            <h1 className="text-display-xl text-balance text-white">{t('contact.title')}</h1>
          </Reveal>
        </Container>
      </section>

      <Section tone="paper">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            {/* Info kontak — tiap fakta jadi kotak bg-surface-2 lebar sama (grid-cols-2 items-stretch),
                mengikuti referensi tapi dengan latar (bukan teks polos di atas halaman). */}
            <Reveal className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-display-xl text-balance">{t('contact.introTitle')}</h2>
                <p className="text-body-l max-content-w text-muted">{t('contact.subtitle')}</p>
              </div>

              <div className="grid grid-cols-2 items-stretch gap-4">
                <a
                  href={waLink('Halo Omah Pala, saya ingin bertanya lebih lanjut.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-2 rounded-md bg-surface-2 p-5 text-body text-ink hover:text-muted"
                >
                  <span className="flex items-center gap-2 text-meta text-muted-2">
                    <IconWhatsapp className="h-4 w-4" aria-hidden />
                    {t('contact.whatsappLabel')}
                  </span>
                  +62 812-3456-7890
                </a>

                <div className="flex flex-col gap-2 rounded-md bg-surface-2 p-5">
                  <span className="flex items-center gap-2 text-meta text-muted-2">
                    <IconMapPin className="h-4 w-4" aria-hidden />
                    {t('contact.addressLabel')}
                  </span>
                  <span className="text-body text-ink">{t('footer.address1')}</span>
                </div>

                <a
                  href="mailto:halo@omahpala.id"
                  className="flex flex-col gap-2 rounded-md bg-surface-2 p-5 text-body text-ink hover:text-muted"
                >
                  <span className="flex items-center gap-2 text-meta text-muted-2">
                    <IconMail className="h-4 w-4" aria-hidden />
                    {t('contact.emailLabel')}
                  </span>
                  halo@omahpala.id
                </a>

                {/* Sosial media — ikon saja, cukup ruang untuk beberapa platform tanpa jadi
                    padat teks. YouTube/TikTok/Facebook: Data contoh — user akan isi URL akun
                    asli sendiri, jangan pernah publish href="#" ini ke produksi. */}
                <div className="flex flex-col gap-2 rounded-md bg-surface-2 p-5">
                  <span className="text-meta text-muted-2">{t('contact.socialLabel')}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href="https://instagram.com/omahpala.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Omah Pala"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-surface"
                    >
                      <IconInstagram className="h-4.5 w-4.5" aria-hidden />
                    </a>
                    <a
                      href="#"
                      aria-label="YouTube Omah Pala"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-surface"
                    >
                      <IconYoutube className="h-4.5 w-4.5" aria-hidden />
                    </a>
                    <a
                      href="#"
                      aria-label="TikTok Omah Pala"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-surface"
                    >
                      <IconTiktok className="h-4.5 w-4.5" aria-hidden />
                    </a>
                    <a
                      href="#"
                      aria-label="Facebook Omah Pala"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink hover:bg-surface"
                    >
                      <IconFacebook className="h-4.5 w-4.5" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="rounded-md bg-surface-2 p-7.5 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-start gap-4">
                  <h2 className="text-title">{t('contact.successTitle')}</h2>
                  <p className="text-body text-muted">{t('contact.successBody')}</p>
                  <Button variant="ghost" onClick={resetForm}>
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-title">{t('contact.formTitle')}</h2>
                    <p className="text-meta text-muted">{t('contact.formSubtitle')}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldWrapper label={t('contact.fieldName')} htmlFor="name" required error={errors.name}>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        autoComplete="name"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldCompany')} htmlFor="company" error={errors.company}>
                      <Input
                        id="company"
                        value={form.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        autoComplete="organization"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldCountry')} htmlFor="country" required error={errors.country}>
                      <Input
                        id="country"
                        value={form.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        autoComplete="country-name"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldEmail')} htmlFor="email" required error={errors.email}>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        autoComplete="email"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldPhone')} htmlFor="phone">
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        autoComplete="tel"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldProduct')} htmlFor="productId">
                      <Select
                        id="productId"
                        value={form.productId}
                        onChange={(e) => handleChange('productId', e.target.value)}
                      >
                        <option value="">{t('contact.fieldProductPlaceholder')}</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.slug}>
                            {locale === 'id' ? p.nameId : p.nameEn}
                          </option>
                        ))}
                      </Select>
                    </FieldWrapper>
                  </div>

                  <FieldWrapper label={t('contact.fieldVolume')} htmlFor="volume">
                    <Input
                      id="volume"
                      value={form.volume}
                      placeholder={t('contact.fieldVolumePlaceholder')}
                      onChange={(e) => handleChange('volume', e.target.value)}
                    />
                  </FieldWrapper>

                  <FieldWrapper label={t('contact.fieldMessage')} htmlFor="message" required error={errors.message}>
                    <Textarea
                      id="message"
                      value={form.message}
                      placeholder={t('contact.fieldMessagePlaceholder')}
                      onChange={(e) => handleChange('message', e.target.value)}
                    />
                  </FieldWrapper>

                  {/* Honeypot — tersembunyi dari pengguna, hanya bot pengisi form yang mengisinya */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                    />
                  </div>

                  {rateLimited && (
                    <p role="alert" className="text-meta text-[#B23A3A]">
                      {t('contact.errorSendFailed')}
                    </p>
                  )}

                  <Button type="submit" variant="primary" disabled={submitting} className="self-start">
                    {submitting ? t('contact.submitting') : t('contact.submit')}
                  </Button>
                </form>
              )}
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Peta — kartu (border + rounded), bukan full-bleed, sesuai referensi terbaru. Tombol
          "Buka di Google Maps" menuju Google Maps sungguhan (bukan cuma OpenStreetMap embed di
          bawahnya). Sengaja tidak pakai rating/ulasan seperti referensi karena data itu tidak
          kita punya — jangan pernah menampilkan angka karangan (lihat "Data contoh" &
          UX-WRITING.md soal kejujuran angka). */}
      <Section tone="paper" className="pt-0">
        <Container>
          <h2 className="mb-5 text-title">{t('contact.mapTitle')}</h2>
          <Reveal className="relative h-[360px] w-full overflow-hidden rounded-lg border border-line sm:h-[420px]">
            <iframe
              title={t('contact.mapTitle')}
              className="h-full w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=110.398%2C-7.675%2C110.445%2C-7.650&layer=mapnik&marker=-7.6631%2C110.4203"
            />
            <div className="absolute top-4 left-4 flex max-w-[260px] flex-col gap-2 rounded-md bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,.16)] sm:top-6 sm:left-6 sm:max-w-xs sm:p-5">
              <p className="text-label text-ink">{t('common.brand')}</p>
              <p className="flex items-start gap-2 text-meta text-muted">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                {t('footer.address1')}
              </p>
            </div>
            <ExternalLinkButton
              href="https://www.google.com/maps?q=-7.6631,110.4203"
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              size="sm"
              className="absolute top-4 right-4 sm:top-6 sm:right-6"
            >
              <IconMapPin className="h-4 w-4" aria-hidden />
              {t('contact.mapDirections')}
            </ExternalLinkButton>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
