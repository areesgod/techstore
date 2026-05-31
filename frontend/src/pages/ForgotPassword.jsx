import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Аккаунт с таким email не зарегистрирован. Проверьте адрес или создайте новый аккаунт.')
      } else {
        setError(err.response?.data?.detail || 'Произошла ошибка. Попробуйте позже.')
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Восстановление пароля</h1>
          <p className="text-gray-500 text-sm mt-1">Укажите email — мы пришлём ссылку для сброса</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Письмо отправлено!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Если аккаунт с адресом <strong>{email}</strong> существует, вы получите письмо со ссылкой для сброса пароля. Проверьте папку «Спам».
              </p>
              <p className="text-xs text-gray-400 mb-4">Ссылка действительна 1 час.</p>
              <Link to="/login" className="btn-primary w-full text-center block">Вернуться к входу</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1" />
                  Email адрес
                </label>
                <input
                  required type="email" className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Отправка...' : 'Отправить ссылку сброса'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary-600 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Вернуться к входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
