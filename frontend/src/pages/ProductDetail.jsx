import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Download, ArrowLeft, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/price'
import api from '../api/client'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 mb-6 text-sm">
        <ArrowLeft size={16} /> {t('products.back')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="h-80 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center overflow-hidden">
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
            : <div className="text-8xl select-none">{product.is_digital ? '💾' : '📦'}</div>}
        </div>

        <div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.is_digital ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {product.is_digital ? t('products.digital_product') : t('products.badge_gadget')}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {product.features?.length > 0 && (
            <ul className="space-y-2 mb-6">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary-700">{formatPrice(product.price)}</span>
            {!product.is_digital && product.stock !== null && (
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? t('products.in_stock', { count: product.stock }) : t('products.out_of_stock')}
              </span>
            )}
          </div>

          <button
            onClick={() => { addItem(product); toast.success(t('products.added_to_cart', { name: product.name })) }}
            disabled={!product.is_digital && product.stock === 0}
            className="btn-primary mt-6 w-full py-3 flex items-center justify-center gap-2 text-base"
          >
            {product.is_digital ? <Download size={18} /> : <ShoppingCart size={18} />}
            {t('products.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  )
}
