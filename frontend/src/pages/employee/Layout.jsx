import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, LogOut, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

const links = [
  { to: '/employee', label: 'Дашборд', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/employee/orders', label: 'Заказы', icon: <ShoppingBag size={18} /> },
]

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() { logout(clearCart); navigate('/') }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-800 text-gray-300 w-60 shrink-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
        <Zap size={20} className="text-amber-400" />
        <span className="font-bold text-white">TechStore</span>
        <span className="ml-auto text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">Сотрудник</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to} to={l.to} end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            {l.icon} {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:flex"><Sidebar /></div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b">
          <button onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="font-bold text-gray-900">Портал сотрудника</span>
        </div>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  )
}
