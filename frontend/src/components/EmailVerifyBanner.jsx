import { useState } from 'react'
import { AlertCircle, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function EmailVerifyBanner() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!user || user.email_verified) return null

  async function handleResend() {
    setSending(true)
    try {
      await api.post('/auth/resend-verification')
      setSent(true)
      toast.success('Письмо отправлено! Проверьте почту.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка отправки.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            Ваш email <strong>{user.email}</strong> не подтверждён.
            Проверьте почту или запросите новое письмо.
          </span>
        </div>
        <button
          onClick={handleResend}
          disabled={sending || sent}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 bg-white border border-amber-300 hover:border-amber-400 rounded-lg px-3 py-1 transition-colors disabled:opacity-50"
        >
          <Mail size={14} />
          {sent ? 'Отправлено ✓' : sending ? 'Отправка…' : 'Отправить снова'}
        </button>
      </div>
    </div>
  )
}
