import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
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

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [billing, setBilling] = useState({ name: '', email: '' })
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', holder: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!card.number.replace(/\s/g, '').match(/^\d{16}$/)) return toast.error('Invalid card number')
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) return toast.error('Invalid expiry date')
    if (!card.cvv.match(/^\d{3,4}$/)) return toast.error('Invalid CVV')

    setLoading(true)
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        billing_email: billing.email,
        billing_name: billing.name,
        payment: {
          card_last4: card.number.replace(/\s/g, '').slice(-4),
          card_holder: card.holder,
        },
      })
      clearCart()
      navigate(`/order-success/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Billing Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required className="input" placeholder="John Doe" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" className="input" placeholder="john@example.com" value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-primary-600" />
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                <Lock size={12} /> Prototype / Mock Payment
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800 mb-4">
              This is a mock payment. Use any 16-digit card number (e.g. <strong>4111 1111 1111 1111</strong>).
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  required
                  className="input font-mono"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                <input required className="input" placeholder="JOHN DOE" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    required
                    className="input"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    required
                    className="input"
                    placeholder="123"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900 mb-5">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Lock size={16} />}
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
