import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 text-primary-700 font-bold text-2xl mb-1">
            <Zap size={24} /> TechStore
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.welcome_back')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('auth.sign_in_subtitle')}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input required type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Забыли пароль?</Link>
              </div>
              <input required type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">{t('auth.create_one')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
