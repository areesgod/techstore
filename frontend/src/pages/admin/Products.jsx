import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

const empty = { name: '', description: '', price: '', is_digital: true, stock: '', image_url: '', features: '', category: 'digital' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const res = await api.get('/products?limit=100')
    setProducts(res.data)
  }

  function openCreate() { setEditing(null); setForm(empty); setShowModal(true) }
  function openEdit(p) {
    setEditing(p)
    setForm({ ...p, price: String(p.price), stock: String(p.stock ?? ''), features: (p.features || []).join('\n') })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: form.is_digital ? null : (parseInt(form.stock) || 0),
        features: form.features.split('\n').filter(Boolean),
      }
      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
        toast.success('Product updated')
      } else {
        await api.post('/products', payload)
        toast.success('Product created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    toast.success('Product deleted')
    load()
  }

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Package size={24} className="text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">{products.length} total products</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input className="input max-w-xs" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                        {p.image_url
                          ? <img src={p.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          : (p.is_digital ? '💾' : '📦')}
                      </div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_digital ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {p.is_digital ? 'Digital' : 'Physical'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{p.category}</td>
                  <td className="px-6 py-4 font-semibold text-primary-700">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{p.is_digital ? '∞' : (p.stock ?? 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-primary-50 hover:text-primary-600 text-gray-400 rounded transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-gray-400">No products found.</div>}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required className="input h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input required type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="digital">Digital</option>
                    <option value="gadgets">Gadgets</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" id="is_digital" checked={form.is_digital} onChange={(e) => setForm({ ...form, is_digital: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                <label htmlFor="is_digital" className="text-sm font-medium">Digital product (downloadable)</label>
              </div>
              {!form.is_digital && (
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                <input className="input" placeholder="https://…" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Features <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea className="input h-24 resize-none font-mono text-sm" placeholder="Feature one&#10;Feature two" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Check size={15} /> {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
