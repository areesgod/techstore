import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Download, Headphones } from 'lucide-react'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

const features = [
  { icon: <Zap size={24} className="text-primary-500" />, title: 'Instant Delivery', desc: 'Digital products delivered instantly to your inbox.' },
  { icon: <Shield size={24} className="text-green-500" />, title: 'Secure Payments', desc: 'Your transactions are always protected.' },
  { icon: <Download size={24} className="text-purple-500" />, title: 'Lifetime Access', desc: 'Download your purchases anytime, forever.' },
  { icon: <Headphones size={24} className="text-orange-500" />, title: '24/7 Support', desc: 'We are here to help whenever you need us.' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api.get('/products?limit=4').then((res) => setFeatured(res.data)).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            The Best Digital Products<br />& Gadgets, All in One Place
          </h1>
          <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">
            Discover top-tier software, eBooks, courses, and premium gadgets. Buy once, use forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-6">Join thousands of customers who trust TechStore for their digital needs.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-block">Create Your Account</Link>
        </div>
      </section>
    </div>
  )
}
