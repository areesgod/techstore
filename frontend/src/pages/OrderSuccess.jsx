import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Download, Mail, Package } from 'lucide-react'
import api from '../api/client'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data)).catch(() => {})
  }, [orderId])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={44} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-2">Order <span className="font-mono font-semibold">#{orderId}</span></p>

      <div className="flex items-center justify-center gap-2 text-sm text-primary-600 mb-8">
        <Mail size={16} />
        <span>A receipt has been sent to your email address.</span>
      </div>

      {order && order.items?.length > 0 && (
        <div className="card p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Your Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-xl">
                    {item.is_digital ? '💾' : '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500">${item.unit_price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </div>
                {item.download_token && (
                  <a
                    href={`/api/downloads/${item.download_token}`}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Download size={14} /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/account" className="btn-secondary flex items-center justify-center gap-2">
          <Package size={16} /> My Downloads
        </Link>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  )
}
