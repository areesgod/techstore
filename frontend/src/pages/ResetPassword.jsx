import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Zap, Lock, CheckCircle, XCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [tokenValid, setTokenValid] = useState(null)   // null=checking, true, false
  const [tokenEmail, setTokenEmail] = useState('')
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    api.get(`/auth/verify-reset-token?token=${token}`)
      .then((r) => { setTokenValid(true); setTokenEmail(r.data.email) })
      .catch(() => setTokenValid(false))
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Пароли не совпадают')
    if (form.password.length < 6) return toast.error('Пароль должен быть не менее 6 символов')

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: form.password })
      setDone(true)
      toast.success('Пароль успешно изменён!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка. Попробуйте снова.')
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
          <h1 className="text-2xl font-bold text-gray-900">Новый пароль</h1>
        </div>

        <div className="card p-8">
          {/* Checking token */}
          {tokenValid === null && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Проверяем ссылку...</p>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={36} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Ссылка недействительна</h2>
              <p className="text-gray-500 text-sm mb-6">
                Эта ссылка для сброса пароля устарела или уже была использована. Запросите новую.
              </p>
              <Link to="/forgot-password" className="btn-primary w-full text-center block">
                Запросить новую ссылку
              </Link>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Пароль изменён!</h2>
              <p className="text-gray-500 text-sm">Перенаправляем на страницу входа...</p>
            </div>
          )}

          {/* Form */}
          {tokenValid === true && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {tokenEmail && (
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Сброс пароля для: <strong>{tokenEmail}</strong>
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock size={13} className="inline mr-1" /> Новый пароль
                </label>
                <input
                  required type="password" className="input"
                  placeholder="Не менее 6 символов"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
                <input
                  required type="password" className="input"
                  placeholder="Повторите пароль"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
              </button>
            </form>
          )}

          {tokenValid !== null && !done && (
            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-primary-600 hover:underline">Вернуться к входу</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
