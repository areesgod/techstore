import { Truck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InfoPage, InfoSection } from './InfoPageLayout'

export default function ShippingPage() {
  const { t } = useTranslation()
  return (
    <InfoPage icon={<Truck size={20} />} title={t('shipping_page.title')}>
      <InfoSection title={t('shipping_page.digital_title')} body={t('shipping_page.digital_body')} />
      <InfoSection title={t('shipping_page.physical_title')} body={t('shipping_page.physical_body')} />
      <InfoSection title={t('shipping_page.tracking_title')} body={t('shipping_page.tracking_body')} />
      <InfoSection title={t('shipping_page.free_title')} body={t('shipping_page.free_body')} />
    </InfoPage>
  )
}
