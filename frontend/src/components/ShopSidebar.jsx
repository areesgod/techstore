import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Truck, RefreshCw, Headphones, ShieldCheck, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const infoLinks = [
  { to: '/info/shipping', icon: <Truck size={15} />, key: 'shipping' },
  { to: '/info/returns', icon: <RefreshCw size={15} />, key: 'returns' },
  { to: '/info/support', icon: <Headphones size={15} />, key: 'support' },
  { to: '/info/guarantee', icon: <ShieldCheck size={15} />, key: 'guarantee' },
]

export default function ShopSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  // Read active category from URL regardless of which page we're on
  const params = new URLSearchParams(location.search)
  const activeCategory = location.pathname === '/products'
    ? (params.get('category') || 'all')
    : 'all'

  const categories = [
    { key: 'all', label: t('products.filter_all') },
    { key: 'digital', label: t('products.filter_digital') },
    { key: 'gadgets', label: t('products.filter_gadgets') },
  ]

  function handleCategory(key) {
    // Always navigate to /products with the correct query param
    if (key === 'all') navigate('/products')
    else navigate(`/products?category=${key}`)
  }

  return (
    <aside className="w-52 shrink-0 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('sidebar.categories')}
        </h3>
        <ul className="space-y-0.5">
          {categories.map((c) => (
            <li key={c.key}>
              <button
                onClick={() => handleCategory(c.key)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === c.key
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c.label}
                <ChevronRight size={13} className="opacity-50" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Info pages */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          {t('sidebar.info')}
        </h3>
        <ul className="space-y-0.5">
          {infoLinks.map((l) => (
            <li key={l.key}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-gray-400">{l.icon}</span>
                {t(`sidebar.${l.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
