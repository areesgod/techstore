import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'

function fuzzyMatch(product, query) {
  if (!query) return false
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

export default function GlobalSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  // Load product list once
  useEffect(() => {
    api.get('/products?limit=100')
      .then((r) => { setAllProducts(r.data); setLoaded(true) })
      .catch(() => {})
  }, [])

  // Filter on every keystroke
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const matches = allProducts.filter((p) => fuzzyMatch(p, query)).slice(0, 6)
    setResults(matches)
  }, [query, allProducts])

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    navigate(`/products?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  function goToProduct(id) {
    setOpen(false)
    setQuery('')
    navigate(`/products/${id}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
            placeholder={t('search.placeholder')}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-primary-400 rounded-lg outline-none transition-colors"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {open && query.trim() && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {results.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                {t('search.suggestions')}
              </div>
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToProduct(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      : (p.is_digital ? '💾' : '📦')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">${p.price.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.is_digital ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {p.is_digital ? 'Digital' : 'Gadget'}
                  </span>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full px-3 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors text-left border-t border-gray-100 font-medium"
              >
                {t('search.view_all', { query })}
              </button>
            </>
          ) : loaded ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              {t('search.no_results', { query })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
