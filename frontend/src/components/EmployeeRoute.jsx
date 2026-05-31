import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function EmployeeRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_employee && !user.is_admin) return <Navigate to="/" replace />
  return <Outlet />
}
