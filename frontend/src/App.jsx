import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ShopLayout from './components/ShopLayout'
import EmailVerifyBanner from './components/EmailVerifyBanner'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import EmployeeRoute from './components/EmployeeRoute'
import AdminLayout from './pages/admin/Layout'
import EmployeeLayout from './pages/employee/Layout'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

import ShippingPage from './pages/info/Shipping'
import ReturnsPage from './pages/info/Returns'
import SupportPage from './pages/info/Support'
import GuaranteePage from './pages/info/Guarantee'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeOrders from './pages/employee/Orders'
import PcBuilder from './pages/PcBuilder'

function StoreShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EmailVerifyBanner />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* ── Store (Navbar + Footer) ── */}
      <Route element={<StoreShell />}>
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/pc-builder" element={<PcBuilder />} />
          <Route path="/info/shipping" element={<ShippingPage />} />
          <Route path="/info/returns" element={<ReturnsPage />} />
          <Route path="/info/support" element={<SupportPage />} />
          <Route path="/info/guarantee" element={<GuaranteePage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>

      {/* ── Employee portal ── */}
      <Route element={<EmployeeRoute />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/orders" element={<EmployeeOrders />} />
        </Route>
      </Route>

      {/* ── Admin panel ── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  )
}
