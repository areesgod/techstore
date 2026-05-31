import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatPrice } from '../../utils/price'
import api from '../../api/client'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_LABELS = {
  pending: 'Новый',
  confirmed: 'Подтверждён',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function handleStatus(newStatus) {
    setUpdating(true)
    try {
      await api.patch(`/employee/orders/${order.id}/status?status=${newStatus}`)
      onStatusChange(order.id, newStatus)
      toast.success(`Статус обновлён: ${STATUS_LABELS[newStatus]}`)
    } catch {
      toast.error('Ошибка при обновлении статуса')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3 font-mono text-gray-500 text-sm">#{order.id}</td>
        <td className="px-4 py-3">
          <p className="font-medium text-gray-900 text-sm">{order.billing_name}</p>
          <p className="text-xs text-gray-400">{order.delivery_city || '—'}</p>
        </td>
        <td className="px-4 py-3 font-semibold text-primary-700 text-sm">{formatPrice(order.total)}</td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
        <td className="px-4 py-3 text-gray-400">{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</td>
      </tr>

      {expanded && (
        <tr className="bg-blue-50/30">
          <td colSpan={6} className="px-6 py-4">
            {/* Items */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Товары</p>
              <div className="space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm bg-white rounded px-3 py-1.5 border border-gray-100">
                    <span className="text-gray-800">{item.product_name} × {item.quantity}</span>
                    <span className="text-primary-700 font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status changer */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Изменить статус</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    disabled={s === order.status || updating}
                    onClick={(e) => { e.stopPropagation(); handleStatus(s) }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      s === order.status
                        ? `${STATUS_COLORS[s]} ring-2 ring-offset-1 ring-current`
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function EmployeeOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const url = filter ? `/employee/orders?status=${filter}` : '/employee/orders'
    setLoading(true)
    api.get(url).then((r) => setOrders(r.data)).finally(() => setLoading(false))
  }, [filter])

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
          <p className="text-sm text-gray-500">{orders.length} заказов</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto text-sm">
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Загрузка...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Нет заказов.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">№</th>
                  <th className="px-4 py-3 text-left">Клиент / Город</th>
                  <th className="px-4 py-3 text-left">Сумма</th>
                  <th className="px-4 py-3 text-left">Статус</th>
                  <th className="px-4 py-3 text-left">Дата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => <OrderRow key={o.id} order={o} onStatusChange={handleStatusChange} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
