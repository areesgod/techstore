import { useEffect, useState } from 'react'
import { Download, Package, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data)).finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5 flex items-center gap-3">
          <User size={28} className="text-primary-500" />
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <Package size={28} className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="font-semibold">{orders.length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <Download size={28} className="text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Downloads Available</p>
            <p className="font-semibold">{orders.flatMap((o) => o.items || []).filter((i) => i.download_token).length}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Order History & Downloads</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-sm text-gray-500">Order #{order.id}</span>
                  <span className="ml-3 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary-700">${order.total.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                    {item.download_token && (
                      <a
                        href={`/api/downloads/${item.download_token}`}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Download size={13} /> Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
