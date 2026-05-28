import { useEffect, useState } from 'react'
import { Shield, ShieldOff, Trash2, Users } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    api.get('/admin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false))
  }

  async function toggleAdmin(id) {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle-admin`)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_admin: res.data.is_admin } : u))
      toast.success('Admin status updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Users size={24} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage customer accounts and admin access.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">
            {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 m-4 rounded-lg" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Total Spent</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name} {u.id === me?.id && <span className="text-xs text-gray-400">(you)</span>}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{u.order_count}</td>
                    <td className="px-6 py-4 font-medium text-primary-700">${u.total_spent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {u.id !== me?.id && (
                          <>
                            <button
                              onClick={() => toggleAdmin(u.id)}
                              title={u.is_admin ? 'Remove admin' : 'Make admin'}
                              className={`p-1.5 rounded transition-colors ${u.is_admin ? 'hover:bg-red-50 hover:text-red-500 text-purple-500' : 'hover:bg-purple-50 hover:text-purple-600 text-gray-400'}`}
                            >
                              {u.is_admin ? <ShieldOff size={15} /> : <Shield size={15} />}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
