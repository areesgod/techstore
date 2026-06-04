import { useEffect, useState } from 'react'
import { Download, Package, User, LogOut, Coins, CreditCard, Banknote, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'
import LoyaltyTier from '../components/LoyaltyTier'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import api from '../api/client'

const METHOD_LABEL = { card: 'Карта', cash: 'Наличные', installment: 'Рассрочка' }
const METHOD_ICON = { card: <CreditCard size={12} />, cash: <Banknote size={12} />, installment: <CalendarDays size={12} /> }

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}
const STATUS_LABELS = { pending:'Новый', confirmed:'Подтверждён', processing:'В обработке', shipped:'Отправлен', delivered:'Доставлен', cancelled:'Отменён' }

export default function Account() {
  const { user, logout } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [cashback, setCashback] = useState([])
  const [loyalty, setLoyalty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    Promise.all([
      api.get('/orders').then((r) => setOrders(r.data)),
      api.get('/cashback/history').then((r) => setCashback(r.data)),
      api.get('/cashback/loyalty').then((r) => setLoyalty(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  function handleLogout() { logout(clearCart); navigate('/') }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('account.title')}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
          <LogOut size={15} /> {t('account.logout')}
        </button>
      </div>

      {/* Loyalty tier card */}
      {loyalty && <div className="mb-6"><LoyaltyTier data={loyalty} /></div>}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <Package size={22} className="text-green-500" />
          <div><p className="text-xs text-gray-500">{t('account.total_orders')}</p><p className="font-bold">{orders.length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Download size={22} className="text-purple-500" />
          <div><p className="text-xs text-gray-500">{t('account.downloads')}</p><p className="font-bold">{orders.flatMap((o) => o.items || []).filter((i) => i.download_token).length}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3 bg-amber-50 border border-amber-200">
          <Coins size={22} className="text-amber-500" />
          <div><p className="text-xs text-amber-600">Кэшбэк</p><p className="font-bold text-amber-700">{loyalty ? formatPrice(loyalty.cashback_balance) : '—'}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'orders', label: 'Заказы' },
          { key: 'cashback', label: 'Кэшбэк' },
          { key: 'tiers', label: 'Уровни' },
        ].map((tb) => (
          <button
            key={tb.key} onClick={() => setTab(tb.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === tb.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tb.label}
          </button>
        ))}
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
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-mono text-gray-500">#{order.id}</span>
                    <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                    {order.delivery_city && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{order.delivery_city}</span>}
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {METHOD_ICON[order.payment_method]} {METHOD_LABEL[order.payment_method]}
                      {order.payment_method === 'installment' && order.installment_months && ` · ${order.installment_months} мес.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-700">{formatPrice(order.total)}</span>
                    {order.cashback_earned > 0 && <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">+{formatPrice(order.cashback_earned)}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                      {item.download_token && (
                        <a href={`/api/downloads/${item.download_token}`} className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-xs">
                          <Download size={12} /> {t('account.download')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'cashback' ? (
        cashback.length === 0 ? (
          <div className="card p-10 text-center text-gray-500">История кэшбэка пуста. Оплатите заказ картой для начисления кэшбэка.</div>
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
      ) : (
        /* Tiers table */
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Уровень</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Мин. сумма покупок</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Кэшбэк</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loyalty?.all_tiers?.map((tier) => {
                const isActive = loyalty.current_tier.key === tier.key
                const isPassed = loyalty.total_spent >= tier.min_spent
                return (
                  <tr key={tier.key} className={isActive ? 'bg-primary-50' : ''}>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: tier.color }}>
                        {tier.key === 'new' ? '👤' : tier.key === 'bronze' ? '🥉' : tier.key === 'silver' ? '🥈' : tier.key === 'gold' ? '🥇' : tier.key === 'platinum' ? '💎' : tier.key === 'diamond' ? '💠' : tier.key === 'elite' ? '👑' : tier.key === 'vip' ? '🌟' : '🔥'} {tier.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tier.min_spent === 0 ? '—' : formatPrice(tier.min_spent)}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: tier.rate > 0 ? tier.color : '#9ca3af' }}>
                      {tier.rate === 0 ? '—' : `${Math.round(tier.rate * 100)}%`}
                    </td>
                    <td className="px-4 py-3">
                      {isActive
                        ? <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">Текущий</span>
                        : isPassed
                          ? <span className="text-green-500 text-xs">✓ Достигнут</span>
                          : <span className="text-gray-400 text-xs">{formatPrice(tier.min_spent - loyalty.total_spent)} осталось</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
