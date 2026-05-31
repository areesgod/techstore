import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import LanguageSwitcher from './LanguageSwitcher'
import GlobalSearch from './GlobalSearch'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useTranslation()

  function handleLogout() { logout(); navigate('/') }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 shrink-0">
            <Zap size={22} className="text-primary-500" />
            TechStore
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium text-sm">{t('nav.products')}</Link>
            {user?.is_employee && !user?.is_admin && (
              <Link to="/employee" className="text-amber-600 hover:text-amber-700 font-medium text-sm">Портал</Link>
            )}
            {user?.is_admin && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium text-sm">{t('nav.admin')}</Link>
            )}
          </div>

          {/* Global search — takes remaining space */}
          <div className="hidden md:flex flex-1">
            <GlobalSearch />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/account" className="flex items-center gap-1 text-gray-600 hover:text-primary-600">
                  <User size={18} />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">{t('nav.logout')}</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">{t('nav.signup')}</Link>
              </div>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (below main row) */}
        <div className="md:hidden pb-3">
          <GlobalSearch />
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/products" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.products')}</Link>
          {user?.is_admin && (
            <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.admin')}</Link>
          )}
          {user ? (
            <>
              <Link to="/account" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.account')}</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block py-2 text-red-600">{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
              <Link to="/register" className="block py-2 text-primary-600 font-medium" onClick={() => setMenuOpen(false)}>{t('nav.signup')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
