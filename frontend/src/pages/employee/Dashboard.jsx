import { useEffect, useState } from 'react'
import { ShoppingBag, Clock, Truck, CheckCircle, DollarSign } from 'lucide-react'
import { formatPrice } from '../../utils/price'
import { Link } from 'react-router-dom'
import api from '../../api/client'

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/employee/stats').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Новые заказы', value: stats?.pending ?? '—', icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'В обработке', value: stats?.processing ?? '—', icon: <ShoppingBag size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Отправлено', value: stats?.shipped ?? '—', icon: <Truck size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Доставлено', value: stats?.delivered ?? '—', icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        {stats?.branch && <p className="text-gray-500 text-sm mt-1">Филиал: <span className="font-medium text-gray-700">{stats.branch}</span></p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`${c.bg} ${c.color} p-2.5 rounded-xl`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-900">Выручка филиала</h2>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats ? formatPrice(stats.revenue) : '—'}</p>
        <p className="text-sm text-gray-500 mt-1">Всего {stats?.total_orders ?? 0} заказов</p>
        <Link to="/employee/orders" className="inline-block mt-4 btn-primary text-sm">Просмотреть заказы</Link>
      </div>
    </div>
  )
}
