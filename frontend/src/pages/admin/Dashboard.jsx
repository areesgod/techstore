import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { formatPrice } from '../../utils/price'
import api from '../../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get('/admin/orders').then((r) => setRecentOrders(r.data.slice(0, 5))).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Revenue', value: stats ? formatPrice(stats.revenue) : '—', icon: <DollarSign size={22} />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { label: 'Total Orders', value: stats?.orders ?? '—', icon: <ShoppingBag size={22} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Active Products', value: stats?.products ?? '—', icon: <Package size={22} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Customers', value: stats?.customers ?? '—', icon: <Users size={22} />, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening in your store.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-center gap-4 shadow-sm`}>
            <div className={`${c.bg} ${c.color} p-3 rounded-xl`}>{c.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-gray-500">#{o.id}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{o.billing_name}</p>
                      <p className="text-xs text-gray-400">{o.billing_email}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{o.items?.length}</td>
                    <td className="px-6 py-3 font-semibold text-primary-700">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{o.status}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
