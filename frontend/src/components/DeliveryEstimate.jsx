import { useState, useEffect } from 'react'
import { Truck, Zap, MapPin, ChevronDown } from 'lucide-react'
import api from '../api/client'

export default function DeliveryEstimate({ productId, isDigital, selectedCity, onCityChange }) {
  const [cities, setCities] = useState([])
  const [estimate, setEstimate] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/delivery/cities').then((r) => setCities(r.data.cities)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedCity || !productId) return
    setLoading(true)
    api.get(`/delivery/estimate?city=${encodeURIComponent(selectedCity)}&product_id=${productId}`)
      .then((r) => setEstimate(r.data))
      .catch(() => setEstimate(null))
      .finally(() => setLoading(false))
  }, [selectedCity, productId])

  if (isDigital) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <Zap size={15} className="shrink-0" />
        <span>Мгновенная доставка на вашу почту после оплаты</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin size={14} className="text-gray-400 shrink-0" />
        <span>Ваш город:</span>
        <div className="relative">
          <select
            value={selectedCity || ''}
            onChange={(e) => onCityChange(e.target.value)}
            className="appearance-none bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none pr-5 text-sm font-medium text-gray-800 cursor-pointer"
          >
            <option value="">— выберите —</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading && <div className="text-xs text-gray-400 animate-pulse">Рассчитываем доставку...</div>}

      {estimate && !loading && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
          estimate.in_stock
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <Truck size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{estimate.message}</p>
            {estimate.delivery_days > 0 && (
              <p className="text-xs opacity-75 mt-0.5">
                Ожидаемая дата: {new Date(estimate.delivery_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
