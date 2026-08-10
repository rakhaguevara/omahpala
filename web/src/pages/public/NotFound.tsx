import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { Seo } from '@/components/layout/Seo'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-32 text-center">
      <Seo title={`404 — ${t('common.brand')}`} description={t('common.notFoundBody')} path="/404" />
      <p className="text-display-l text-muted-2">404</p>
      <h1 className="text-display-m">{t('common.notFoundTitle')}</h1>
      <p className="text-body text-muted">{t('common.notFoundBody')}</p>
      <LinkButton to="/" variant="dark">
        {t('common.backHome')}
      </LinkButton>
    </Container>
  )
}
