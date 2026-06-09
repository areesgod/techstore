import { useEffect, useState } from 'react'
import { Shield, ShieldOff, UserCheck, UserX, Trash2, Users, Building2 } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/branches'),
    ]).then(([u, b]) => {
      setUsers(u.data)
      setBranches(b.data)
    }).finally(() => setLoading(false))
  }, [])

  async function toggleAdmin(id) {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle-admin`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: res.data.is_admin, is_employee: res.data.is_employee } : u))
      toast.success('Role updated')
    } catch (err) { toast.error(err.response?.data?.detail || 'Error') }
  }

  async function toggleEmployee(id) {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle-employee`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_employee: res.data.is_employee, branch_id: res.data.branch_id } : u))
      toast.success('Role updated')
    } catch (err) { toast.error(err.response?.data?.detail || 'Error') }
  }

  async function setBranch(id, branch_id) {
    try {
      await api.patch(`/admin/users/${id}/branch`, null, { params: { branch_id } })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, branch_id: Number(branch_id) } : u))
      toast.success('Branch assigned')
    } catch (err) { toast.error(err.response?.data?.detail || 'Error') }
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.detail || 'Error') }
  }

  function roleLabel(u) {
    if (u.is_admin) return { label: 'Admin', cls: 'bg-purple-100 text-purple-700' }
    if (u.is_employee) return { label: 'Employee', cls: 'bg-amber-100 text-amber-700' }
    return { label: 'Customer', cls: 'bg-gray-100 text-gray-600' }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Users size={24} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage roles, branches and accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 m-4 rounded-lg" />)}</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Branch</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Spent</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const role = roleLabel(u)
                  const isSelf = u.id === me?.id
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${role.cls}`}>{role.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_employee ? (
                          <select
                            value={u.branch_id || ''}
                            onChange={(e) => setBranch(u.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                          >
                            <option value="">— no branch —</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{u.order_count}</td>
                      <td className="px-6 py-4 font-medium text-primary-700">{u.total_spent.toLocaleString()} ₸</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {!isSelf && (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => toggleAdmin(u.id)}
                              title={u.is_admin ? 'Remove admin' : 'Make admin'}
                              className={`p-1.5 rounded transition-colors ${u.is_admin ? 'hover:bg-red-50 hover:text-red-500 text-purple-500' : 'hover:bg-purple-50 hover:text-purple-600 text-gray-400'}`}
                            >
                              {u.is_admin ? <ShieldOff size={15} /> : <Shield size={15} />}
                            </button>
                            <button
                              onClick={() => toggleEmployee(u.id)}
                              title={u.is_employee ? 'Remove employee' : 'Make employee'}
                              className={`p-1.5 rounded transition-colors ${u.is_employee ? 'hover:bg-red-50 hover:text-red-500 text-amber-500' : 'hover:bg-amber-50 hover:text-amber-600 text-gray-400'}`}
                            >
                              {u.is_employee ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id, u.name)}
                              className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
