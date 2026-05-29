import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPage, InfoSection } from './InfoPageLayout'

export default function GuaranteePage() {
  const { t } = useTranslation()
  return (
    <InfoPage icon={<ShieldCheck size={20} />} title={t('guarantee_page.title')}>
      <InfoSection title={t('guarantee_page.promise_title')} body={t('guarantee_page.promise_body')} />
      <InfoSection title={t('guarantee_page.digital_title')} body={t('guarantee_page.digital_body')} />
      <InfoSection title={t('guarantee_page.physical_title')} body={t('guarantee_page.physical_body')} />
      <InfoSection title={t('guarantee_page.satisfaction_title')} body={t('guarantee_page.satisfaction_body')} />
    </InfoPage>
  )
}
