import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FieldWrapper, Input, Select, Textarea } from '@/components/ui/Field'
import { IconInstagram, IconMail, IconMapPin, IconWhatsapp } from '@/components/ui/Icons'
import { Reveal } from '@/components/motion/Reveal'
import { Seo } from '@/components/layout/Seo'
import { useInquiries, useProducts } from '@/lib/useEntities'
import { useLocale } from '@/lib/useLocale'
import { waLink } from '@/lib/utils'
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
    const required: (keyof FormState)[] = ['name', 'company', 'country', 'email', 'message']
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

      <Section tone="paper" className="pt-36">
        <Container>
          <Reveal className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
            <Eyebrow className="justify-center">{t('contact.eyebrow')}</Eyebrow>
            <h1 className="text-display-l text-balance">{t('contact.title')}</h1>
            <p className="text-body-l max-content-w text-muted">{t('contact.subtitle')}</p>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <Reveal>
              {submitted ? (
                <div className="flex flex-col items-start gap-4 rounded-md bg-surface-2 p-8">
                  <h2 className="text-title">{t('contact.successTitle')}</h2>
                  <p className="text-body text-muted">{t('contact.successBody')}</p>
                  <Button variant="ghost" onClick={resetForm}>
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  <h2 className="text-title">{t('contact.formTitle')}</h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldWrapper label={t('contact.fieldName')} htmlFor="name" required error={errors.name}>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        autoComplete="name"
                      />
                    </FieldWrapper>
                    <FieldWrapper label={t('contact.fieldCompany')} htmlFor="company" required error={errors.company}>
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
                      {t('contact.errorRequired')}
                    </p>
                  )}

                  <Button type="submit" variant="primary" disabled={submitting} className="self-start">
                    {submitting ? t('contact.submitting') : t('contact.submit')}
                  </Button>
                </form>
              )}
            </Reveal>

            <Reveal delay={0.1} className="flex flex-col gap-5 rounded-md bg-surface-2 p-7.5 h-fit">
              <h2 className="text-title">{t('contact.directTitle')}</h2>
              <a
                href={waLink('Halo Omah Pala, saya ingin bertanya lebih lanjut.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-body text-ink hover:text-muted"
              >
                <IconWhatsapp className="h-5 w-5 text-muted-2" aria-hidden />
                <div>
                  <p className="text-meta text-muted-2">{t('contact.whatsappLabel')}</p>
                  +62 812-3456-7890
                </div>
              </a>
              <a
                href="mailto:halo@omahpala.id"
                className="flex items-center gap-3 text-body text-ink hover:text-muted"
              >
                <IconMail className="h-5 w-5 text-muted-2" aria-hidden />
                <div>
                  <p className="text-meta text-muted-2">{t('contact.emailLabel')}</p>
                  halo@omahpala.id
                </div>
              </a>
              <a
                href="https://instagram.com/omahpala.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-body text-ink hover:text-muted"
              >
                <IconInstagram className="h-5 w-5 text-muted-2" aria-hidden />
                <div>
                  <p className="text-meta text-muted-2">{t('contact.instagramLabel')}</p>
                  @omahpala.id
                </div>
              </a>
              <div className="flex items-start gap-3 text-body text-ink">
                <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-2" aria-hidden />
                <div>
                  <p className="text-meta text-muted-2">{t('contact.addressLabel')}</p>
                  {t('footer.address1')}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  )
}
