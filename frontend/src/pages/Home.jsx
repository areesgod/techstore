import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Download, Headphones } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState([])

  const features = [
    { icon: <Zap size={24} className="text-primary-500" />, title: t('home.feat_delivery_title'), desc: t('home.feat_delivery_desc') },
    { icon: <Shield size={24} className="text-green-500" />, title: t('home.feat_secure_title'), desc: t('home.feat_secure_desc') },
    { icon: <Download size={24} className="text-purple-500" />, title: t('home.feat_lifetime_title'), desc: t('home.feat_lifetime_desc') },
    { icon: <Headphones size={24} className="text-orange-500" />, title: t('home.feat_support_title'), desc: t('home.feat_support_desc') },
  ]

  useEffect(() => {
    api.get('/products?limit=4').then((res) => setFeatured(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">{t('home.hero_title')}</h1>
          <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">{t('home.hero_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
              {t('home.shop_now')} <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              {t('home.create_account')}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('home.featured_products')}</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              {t('home.view_all')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.cta_title')}</h2>
          <p className="text-gray-400 mb-6">{t('home.cta_desc')}</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-block">{t('home.cta_button')}</Link>
        </div>
      </section>
    </div>
  )
}
