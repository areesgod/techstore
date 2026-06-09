import { useEffect, useState } from 'react'
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function handleStatus(e) {
    e.stopPropagation()
    const status = e.target.value
    setUpdating(true)
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status })
      onStatusChange(order.id, status)
      toast.success(`Status → ${status}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-6 py-4 font-mono text-gray-500">#{order.id}</td>
        <td className="px-6 py-4">
          <p className="font-medium text-gray-900">{order.billing_name}</p>
          <p className="text-xs text-gray-400">{order.billing_email}</p>
        </td>
        <td className="px-6 py-4 text-gray-600">{order.items?.length} item(s)</td>
        <td className="px-6 py-4 font-semibold text-primary-700">{order.total.toLocaleString()} ₸</td>
        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
          <select
            value={order.status}
            onChange={handleStatus}
            disabled={updating}
            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td className="px-6 py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
        <td className="px-6 py-4 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={7} className="px-8 py-4">
            <div className="flex gap-6 text-xs text-gray-500 mb-3 flex-wrap">
              <span>Payment: <strong className="text-gray-700">{order.payment_method}</strong></span>
              {order.delivery_city && <span>City: <strong className="text-gray-700">{order.delivery_city}</strong></span>}
              {order.cashback_earned > 0 && <span>Cashback earned: <strong className="text-green-600">+{order.cashback_earned.toLocaleString()} ₸</strong></span>}
              {order.cashback_used > 0 && <span>Cashback used: <strong className="text-amber-600">-{order.cashback_used.toLocaleString()} ₸</strong></span>}
            </div>
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Items</p>
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-4 py-2 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span>{item.is_digital ? '💾' : '📦'}</span>
                    <span className="font-medium text-gray-800">{item.product_name}</span>
                    <span className="text-gray-400">× {item.quantity}</span>
                  </div>
                  <span className="text-primary-700 font-medium">{(item.unit_price * item.quantity).toLocaleString()} ₸</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    api.get('/admin/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  function handleStatusChange(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.billing_name.toLowerCase().includes(search.toLowerCase()) ||
      o.billing_email.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} total orders</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="input text-sm py-1.5"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="input max-w-xs text-sm"
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 m-4 rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(o => <OrderRow key={o.id} order={o} onStatusChange={handleStatusChange} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
