import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, Coins, MapPin, Truck, Banknote, CalendarDays, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

const PAYMENT_METHODS = [
  { key: 'card',        label: 'Онлайн-карта',   icon: <CreditCard size={18} />,    desc: 'Visa / Mastercard / Мир. Кэшбэк начисляется.' },
  { key: 'cash',        label: 'Наличные',        icon: <Banknote size={18} />,      desc: 'Оплата при получении. Кэшбэк не начисляется.' },
  { key: 'installment', label: 'Рассрочка',       icon: <CalendarDays size={18} />,  desc: 'Разделите платёж на 3, 6 или 12 месяцев.' },
]

const INSTALLMENT_PLANS = [3, 6, 12]

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [billing, setBilling] = useState({ name: user?.name || '', email: user?.email || '' })
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' })
  const [city, setCity] = useState(() => localStorage.getItem('preferred_city') || '')
  const [cities, setCities] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [installmentMonths, setInstallmentMonths] = useState(3)
  const [useCashback, setUseCashback] = useState(false)
  const [cashbackInfo, setCashbackInfo] = useState(null)

  useEffect(() => {
    api.get('/delivery/cities').then((r) => setCities(r.data.cities)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    api.get(`/cashback/preview?order_total=${total}`).then((r) => setCashbackInfo(r.data)).catch(() => {})
  }, [total, user])

  // cashback only applies to card payments
  const canUseCashback = paymentMethod === 'card' && cashbackInfo?.max_usable >= 500
  const cashbackDiscount = (canUseCashback && useCashback) ? (cashbackInfo?.max_usable || 0) : 0
  const finalTotal = Math.max(0, total - cashbackDiscount)
  const monthlyPayment = paymentMethod === 'installment' ? Math.ceil(finalTotal / installmentMonths) : 0
  const willEarn = paymentMethod === 'card' ? Math.round(finalTotal * (cashbackInfo?.rate_pct || 0) / 100) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (paymentMethod === 'card') {
      if (!card.number.replace(/\s/g, '').match(/^\d{16}$/)) return toast.error('Неверный номер карты')
      if (!card.expiry.match(/^\d{2}\/\d{2}$/)) return toast.error('Неверная дата истечения')
      if (!card.cvv.match(/^\d{3,4}$/)) return toast.error('Неверный CVV')
    }
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        billing_email: billing.email,
        billing_name: billing.name,
        delivery_city: city || null,
        use_cashback: useCashback && paymentMethod === 'card',
        payment_method: paymentMethod,
        installment_months: paymentMethod === 'installment' ? installmentMonths : null,
        payment: paymentMethod === 'card'
          ? { card_last4: card.number.replace(/\s/g, '').slice(-4), card_holder: card.holder }
          : null,
      })
      clearCart()
      navigate(`/order-success/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка оформления. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">

          {/* Billing */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('checkout.billing')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.full_name')}</label>
                <input required className="input" placeholder="Иван Иванов" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.email')}</label>
                <input required type="email" className="input" value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} />
              </div>
            </div>
          </div>

          {/* City */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-primary-600" />
              <h2 className="text-lg font-semibold">Город доставки</h2>
            </div>
            <select value={city} onChange={(e) => { setCity(e.target.value); localStorage.setItem('preferred_city', e.target.value) }} className="input">
              <option value="">— выберите город —</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Payment method selector */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Способ оплаты</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === m.key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio" name="payment_method" value={m.key}
                    checked={paymentMethod === m.key}
                    onChange={() => setPaymentMethod(m.key)}
                    className="accent-primary-600 w-4 h-4"
                  />
                  <div className={`${paymentMethod === m.key ? 'text-primary-600' : 'text-gray-400'}`}>{m.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                  {m.key === 'card' && paymentMethod === 'card' && cashbackInfo?.rate_pct > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      +{cashbackInfo.rate_pct}% кэшбэк
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Installment plan picker */}
            {paymentMethod === 'installment' && (
              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700 mb-3">Выберите срок рассрочки</p>
                <div className="grid grid-cols-3 gap-3">
                  {INSTALLMENT_PLANS.map((m) => (
                    <button
                      key={m} type="button"
                      onClick={() => setInstallmentMonths(m)}
                      className={`p-3 rounded-xl border-2 text-center transition-colors ${
                        installmentMonths === m
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-lg text-gray-900">{m}</p>
                      <p className="text-xs text-gray-500">месяцев</p>
                      <p className="text-sm font-semibold text-primary-600 mt-1">{formatPrice(Math.ceil(finalTotal / m))}/мес</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Card details */}
            {paymentMethod === 'card' && (
              <div className="mt-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                  {t('checkout.mock_note')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.card_number')}</label>
                  <input required className="input font-mono" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.card_holder')}</label>
                  <input required className="input" placeholder="IVAN IVANOV" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.expiry')}</label>
                    <input required className="input" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.cvv')}</label>
                    <input required className="input" placeholder="123" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                  </div>
                </div>
              </div>
            )}

            {/* Cash info */}
            {paymentMethod === 'cash' && (
              <div className="mt-4 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
                <Truck size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>Оплата принимается наличными при получении заказа в вашем городе. Убедитесь, что у вас будет точная сумма.</span>
              </div>
            )}
          </div>

          {/* Cashback toggle (card only) */}
          {canUseCashback && (
            <div className="card p-5 border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Кэшбэк: {formatPrice(cashbackInfo.balance)}</p>
                    <p className="text-xs text-amber-600">Можно применить до {formatPrice(cashbackInfo.max_usable)}</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={useCashback} onChange={(e) => setUseCashback(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm font-medium text-amber-800">Применить</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="card p-6 h-fit space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{t('checkout.summary')}</h2>

          <div className="max-h-40 overflow-y-auto space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Подытог</span><span>{formatPrice(total)}</span>
            </div>
            {cashbackDiscount > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>Кэшбэк</span><span>− {formatPrice(cashbackDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
              <span>Итого</span><span>{formatPrice(finalTotal)}</span>
            </div>
            {paymentMethod === 'installment' && (
              <div className="flex justify-between text-primary-600 font-medium">
                <span>{installmentMonths} мес. × </span>
                <span>{formatPrice(monthlyPayment)}/мес</span>
              </div>
            )}
          </div>

          {willEarn > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 flex items-center gap-1.5">
              <CheckCircle size={13} />
              Вы получите <span className="font-bold">{formatPrice(willEarn)}</span> кэшбэка
            </div>
          )}

          {paymentMethod !== 'card' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 flex items-center gap-1.5">
              <Coins size={13} />
              Кэшбэк начисляется только при оплате картой
            </div>
          )}

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Lock size={16} />}
            {loading
              ? t('checkout.processing')
              : paymentMethod === 'cash'
                ? `Оформить заказ • ${formatPrice(finalTotal)}`
                : paymentMethod === 'installment'
                  ? `Рассрочка • ${formatPrice(monthlyPayment)}/мес`
                  : t('checkout.pay', { amount: formatPrice(finalTotal) })
            }
          </button>
        </div>
      </form>
    </div>
  )
}
