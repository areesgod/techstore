import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Zap size={20} className="text-primary-400" />
              TechStore
            </div>
            <p className="text-sm">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{t('footer.shop')}</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/products" className="hover:text-white">{t('footer.all_products')}</Link></li>
              <li><Link to="/products?category=digital" className="hover:text-white">{t('footer.digital')}</Link></li>
              <li><Link to="/products?category=gadgets" className="hover:text-white">{t('footer.gadgets')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{t('footer.account')}</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/login" className="hover:text-white">{t('footer.login')}</Link></li>
              <li><Link to="/register" className="hover:text-white">{t('footer.create_account')}</Link></li>
              <li><Link to="/account" className="hover:text-white">{t('footer.my_downloads')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} TechStore. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
