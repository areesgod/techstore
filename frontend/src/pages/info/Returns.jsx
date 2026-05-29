import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPage, InfoSection } from './InfoPageLayout'

export default function ReturnsPage() {
  const { t } = useTranslation()
  return (
    <InfoPage icon={<RefreshCw size={20} />} title={t('returns_page.title')}>
      <InfoSection title={t('returns_page.physical_title')} body={t('returns_page.physical_body')} />
      <InfoSection title={t('returns_page.digital_title')} body={t('returns_page.digital_body')} />
      <InfoSection title={t('returns_page.refund_title')} body={t('returns_page.refund_body')} />
      <InfoSection title={t('returns_page.damaged_title')} body={t('returns_page.damaged_body')} />
    </InfoPage>
  )
}
