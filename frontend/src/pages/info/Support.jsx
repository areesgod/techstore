import { Headphones } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPage, InfoSection } from './InfoPageLayout'

export default function SupportPage() {
  const { t } = useTranslation()
  return (
    <InfoPage icon={<Headphones size={20} />} title={t('support_page.title')}>
      <InfoSection title={t('support_page.email_title')} body={t('support_page.email_body')} />
      <InfoSection title={t('support_page.hours_title')} body={t('support_page.hours_body')} />
      <InfoSection title={t('support_page.faq_title')} body={t('support_page.faq_body')} />
      <InfoSection title={t('support_page.response_title')} body={t('support_page.response_body')} />
    </InfoPage>
  )
}
