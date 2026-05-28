import { Link } from 'react-router-dom'
import { ShoppingCart, Download, Star } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  function handleAdd() {
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/products/${product.id}`}>
        <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="text-6xl select-none">{product.is_digital ? '💾' : '📦'}</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
            {product.name}
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${product.is_digital ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {product.is_digital ? 'Digital' : 'Gadget'}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-700">${product.price.toFixed(2)}</span>
          <button onClick={handleAdd} className="btn-primary text-sm py-1.5 flex items-center gap-1.5">
            {product.is_digital ? <Download size={14} /> : <ShoppingCart size={14} />}
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
