import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    const form = new URLSearchParams({ username: email, password })
    const res = await api.post('/auth/token', form)
    localStorage.setItem('token', res.data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }

  // Used after email verification — token comes from the verify-email response
  async function loginWithToken(accessToken) {
    localStorage.setItem('token', accessToken)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }

  async function register(name, email, password) {
    await api.post('/auth/register', { name, email, password })
    // don't auto-login — user must verify email first
  }

  function logout(clearCartFn) {
    localStorage.removeItem('token')
    localStorage.removeItem('cart')
    setUser(null)
    clearCartFn?.()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
