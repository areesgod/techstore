import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Zap, CheckCircle, XCircle, Mail } from 'lucide-react'
import api from '../api/client'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('verifying')  // verifying | success | error
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Ссылка некорректна — токен не указан.')
      return
    }
    api.post(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => {
        setStatus('success')
        setMessage(r.data.message || 'Email подтверждён!')
        setEmail(r.data.email || '')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Не удалось подтвердить email.')
      })
  }, [token])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 text-primary-700 font-bold text-2xl mb-1">
            <Zap size={24} /> TechStore
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Подтверждение email</h1>
        </div>

        <div className="card p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-blue-500 animate-pulse" />
              </div>
              <p className="text-gray-600">Проверяем ссылку...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Готово! 🎉</h2>
              <p className="text-gray-600 text-sm mb-2">{message}</p>
              {email && <p className="text-xs text-gray-400 mb-6">{email}</p>}
              <Link to="/login" className="btn-primary w-full text-center block">Войти в аккаунт</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={36} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Не удалось подтвердить</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <Link to="/login" className="btn-secondary w-full text-center block mb-2">Войти, чтобы запросить новую ссылку</Link>
              <Link to="/" className="text-sm text-gray-500 hover:underline">На главную</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
