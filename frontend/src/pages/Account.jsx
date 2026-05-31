import { useEffect, useState } from 'react'
import { Download, Package, User, LogOut, Coins, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [cashback, setCashback] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    Promise.all([
      api.get('/orders').then((r) => setOrders(r.data)),
      api.get('/cashback/history').then((r) => setCashback(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  function handleLogout() { logout(); navigate('/') }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('account.title')}</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
          <LogOut size={15} /> {t('account.logout')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-3">
          <User size={24} className="text-primary-500" />
          <div><p className="text-xs text-gray-500">{t('account.name')}</p><p className="font-semibold text-sm">{user?.name}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Package size={24} className="text-green-500" />
          <div><p className="text-xs text-gray-500">{t('account.total_orders')}</p><p className="font-semibold">{orders.length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Download size={24} className="text-purple-500" />
          <div><p className="text-xs text-gray-500">{t('account.downloads')}</p><p className="font-semibold">{orders.flatMap((o) => o.items || []).filter((i) => i.download_token).length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3 bg-amber-50 border border-amber-200">
          <Coins size={24} className="text-amber-500" />
          <div><p className="text-xs text-amber-600">Кэшбэк</p><p className="font-bold text-amber-700">{formatPrice(user?.cashback_balance || 0)}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('orders')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          {t('account.history_title')}
        </button>
        <button onClick={() => setTab('cashback')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'cashback' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
          <Coins size={13} /> Кэшбэк
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map((i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
      ) : tab === 'orders' ? (
        orders.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">{t('account.no_orders')}</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm text-gray-500">#{order.id}</span>
                    <span className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                    {order.delivery_city && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{order.delivery_city}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-700">{formatPrice(order.total)}</span>
                    {order.cashback_earned > 0 && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">+{formatPrice(order.cashback_earned)} кэшбэк</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      {item.download_token && (
                        <a href={`/api/downloads/${item.download_token}`} className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                          <Download size={13} /> {t('account.download')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        cashback.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">История кэшбэка пуста.</div>
        ) : (
          <div className="card overflow-hidden">
            {cashback.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earned' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Coins size={15} className={tx.type === 'earned' ? 'text-green-600' : 'text-red-500'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'earned' ? '+' : ''}{formatPrice(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
