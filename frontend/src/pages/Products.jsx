import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import ShopSidebar from '../components/ShopSidebar'

function fuzzyMatch(product, query) {
  if (!query) return true
  const q = query.toLowerCase().trim()
  const haystack = `${product.name} ${product.description || ''}`.toLowerCase()
  if (haystack.includes(q)) return true
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length > 1 && words.every((w) => haystack.includes(w))) return true
  let qi = 0
  for (let i = 0; i < haystack.length && qi < q.length; i++) {
    if (haystack[i] === q[qi]) qi++
  }
  return qi === q.length
}

function matchesPrice(price, range) {
  if (!range) return true
  if (range === 'under_20') return price < 10000
  if (range === '20_to_50') return price >= 10000 && price <= 30000
  if (range === '50_to_100') return price > 30000 && price <= 80000
  if (range === 'over_100') return price > 80000
  return true
}

export default function Products() {
  const { t } = useTranslation()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const urlQuery = searchParams.get('q') || ''
  const [search, setSearch] = useState(urlQuery)
  const searchRef = useRef(null)

  useEffect(() => { setSearch(urlQuery) }, [urlQuery])

  useEffect(() => {
    setLoading(true)
    api.get('/products?limit=100')
      .then((res) => setAllProducts(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (category !== 'all') {
        // legacy support for old 'digital'/'gadgets' keys
        if (category === 'digital' && !p.is_digital) return false
        if (category === 'gadgets' && p.is_digital) return false
        // new specific category keys
        if (category !== 'digital' && category !== 'gadgets' && p.category !== category) return false
      }
      if (!matchesPrice(p.price, priceRange)) return false
      return fuzzyMatch(p, search)
    })
  }, [allProducts, category, priceRange, search])

  const priceOptions = [
    { key: '', label: t('products.all_prices') },
    { key: 'under_20', label: t('products.under_20') },
    { key: '20_to_50', label: t('products.20_to_50') },
    { key: '50_to_100', label: t('products.50_to_100') },
    { key: 'over_100', label: t('products.over_100') },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">{t('products.results_count', { count: filtered.length })}</p>
          )}
        </div>
        <button className="lg:hidden flex items-center gap-2 btn-secondary text-sm" onClick={() => setSidebarOpen(true)}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {/* Search + price filter row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder={t('products.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(''); searchRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="input w-auto text-sm pr-8"
        >
          {priceOptions.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative bg-white w-64 h-full overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-gray-900">Filters</span>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <ShopSidebar />
          </div>
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('products.no_products')}</h3>
          {search && <p className="text-sm text-gray-400">No results for "<span className="font-medium text-gray-600">{search}</span>"</p>}
          {search && <button onClick={() => setSearch('')} className="mt-4 btn-secondary text-sm">Clear search</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
