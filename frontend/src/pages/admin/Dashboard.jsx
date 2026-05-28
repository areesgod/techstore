import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'
import api from '../../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toFixed(2)}` : '—', icon: <DollarSign size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Total Orders', value: stats?.orders ?? '—', icon: <ShoppingBag size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Products', value: stats?.products ?? '—', icon: <Package size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Customers', value: stats?.customers ?? '—', icon: <Users size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <div key={c.label} className={`card p-5 flex items-center gap-4`}>
            <div className={`${c.bg} p-3 rounded-xl`}>{c.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/admin/products" className="card p-6 hover:shadow-md transition-shadow">
          <Package size={32} className="text-purple-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Manage Products</h2>
          <p className="text-sm text-gray-500">Add, edit, and remove products from your store.</p>
        </Link>
        <Link to="/admin/orders" className="card p-6 hover:shadow-md transition-shadow">
          <ShoppingBag size={32} className="text-blue-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">View Orders</h2>
          <p className="text-sm text-gray-500">Browse all customer orders and manage fulfillment.</p>
        </Link>
      </div>
    </div>
  )
}
