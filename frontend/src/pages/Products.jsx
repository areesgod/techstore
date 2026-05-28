import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Truck, RefreshCw, Headphones, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

// ─── Fuzzy match ──────────────────────────────────────────────────────────────
// Returns true when the product is "similar enough" to the query.
// Priority: substring → all words present → character subsequence
function fuzzyMatch(product, query) {
  if (!query) return true
  const q = query.toLowerCase().trim()
  const haystack = `${product.name} ${product.description || ''}`.toLowerCase()

  // 1. Direct substring
  if (haystack.includes(q)) return true

  // 2. Every word in the query appears somewhere
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length > 1 && words.every((w) => haystack.includes(w))) return true

  // 3. Subsequence — all characters of q appear in order in haystack
  let qi = 0
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) qi++
  }
  return qi === q.length
}

// ─── Price filter ─────────────────────────────────────────────────────────────
function matchesPrice(price, range) {
  if (!range) return true
  if (range === 'under_20') return price < 20
  if (range === '20_to_50') return price >= 20 && price <= 50
  if (range === '50_to_100') return price > 50 && price <= 100
  if (range === 'over_100') return price > 100
  return true
}

// ─── Sidebar accordion item ───────────────────────────────────────────────────
function InfoItem({ icon, title, body }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        <span className="flex items-center gap-2">{icon}{title}</span>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <p className="text-xs text-gray-500 leading-relaxed pb-3">{body}</p>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Products() {
  const { t } = useTranslation()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const searchRef = useRef(null)

  // Load ALL products once — filtering is done client-side for real-time search
  useEffect(() => {
    setLoading(true)
    api.get('/products?limit=100')
      .then((res) => setAllProducts(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Client-side filter: category → price → fuzzy search
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (category === 'digital' && !p.is_digital) return false
      if (category === 'gadgets' && p.is_digital) return false
      if (!matchesPrice(p.price, priceRange)) return false
      return fuzzyMatch(p, search)
    })
  }, [allProducts, category, priceRange, search])

  function setCategory(c) {
    if (c === 'all') setSearchParams({})
    else setSearchParams({ category: c })
  }

  const categories = [
    { key: 'all', label: t('products.filter_all') },
    { key: 'digital', label: t('products.filter_digital') },
    { key: 'gadgets', label: t('products.filter_gadgets') },
  ]

  const priceOptions = [
    { key: '', label: t('products.all_prices') },
    { key: 'under_20', label: t('products.under_20') },
    { key: '20_to_50', label: t('products.20_to_50') },
    { key: '50_to_100', label: t('products.50_to_100') },
    { key: 'over_100', label: t('products.over_100') },
  ]

  const infoItems = [
    { icon: <Truck size={14} />, title: t('products.shipping_title'), body: t('products.shipping_body') },
    { icon: <RefreshCw size={14} />, title: t('products.returns_title'), body: t('products.returns_body') },
    { icon: <Headphones size={14} />, title: t('products.support_title'), body: t('products.support_body') },
    { icon: <ShieldCheck size={14} />, title: t('products.guarantee_title'), body: t('products.guarantee_body') },
  ]

  // ── Sidebar content (shared between desktop and mobile drawer) ──
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('products.categories')}</h3>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.key}>
              <button
                onClick={() => { setCategory(c.key); setSidebarOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === c.key
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('products.price_range')}</h3>
        <ul className="space-y-1">
          {priceOptions.map((p) => (
            <li key={p.key}>
              <button
                onClick={() => setPriceRange(p.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  priceRange === p.key
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${priceRange === p.key ? 'bg-primary-600' : 'bg-gray-300'}`} />
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Store info accordions */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('products.info_title')}</h3>
        <div className="bg-white rounded-xl border border-gray-100 px-4">
          {infoItems.map((item) => (
            <InfoItem key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('products.title')}</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">{t('products.results_count', { count: filtered.length })}</p>
          )}
        </div>
        <button
          className="lg:hidden flex items-center gap-2 btn-secondary text-sm"
          onClick={() => setSidebarOpen(true)}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          placeholder={t('products.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm shadow-sm"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); searchRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <span className="font-semibold text-gray-900">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('products.no_products')}</h3>
              {search && (
                <p className="text-sm text-gray-400">
                  No results for "<span className="font-medium text-gray-600">{search}</span>"
                </p>
              )}
              {search && (
                <button onClick={() => setSearch('')} className="mt-4 btn-secondary text-sm">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
