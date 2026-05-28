import { useEffect, useState } from 'react'
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/client'

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-6 py-4 font-mono text-gray-500">#{order.id}</td>
        <td className="px-6 py-4">
          <p className="font-medium text-gray-900">{order.billing_name}</p>
          <p className="text-xs text-gray-400">{order.billing_email}</p>
        </td>
        <td className="px-6 py-4 text-gray-600">{order.items?.length} item(s)</td>
        <td className="px-6 py-4 font-semibold text-primary-700">${order.total.toFixed(2)}</td>
        <td className="px-6 py-4">
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {order.status}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
        <td className="px-6 py-4 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={7} className="px-8 py-4">
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Order Items</p>
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-4 py-2 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span>{item.is_digital ? '💾' : '📦'}</span>
                    <span className="font-medium text-gray-800">{item.product_name}</span>
                    <span className="text-gray-400">× {item.quantity}</span>
                  </div>
                  <span className="text-primary-700 font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {order.payment_ref && (
              <p className="text-xs text-gray-400 mt-2">Payment ref: <span className="font-mono">{order.payment_ref}</span></p>
            )}
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

  useEffect(() => {
    api.get('/admin/orders').then((r) => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) =>
    !search ||
    o.billing_name.toLowerCase().includes(search.toLowerCase()) ||
    o.billing_email.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} total orders</p>
          </div>
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search by name, email or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">
            {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 m-4 rounded-lg" />)}
          </div>
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
                {filtered.map((o) => <OrderRow key={o.id} order={o} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
