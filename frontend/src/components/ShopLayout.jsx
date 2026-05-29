import { Outlet } from 'react-router-dom'
import ShopSidebar from './ShopSidebar'

export default function ShopLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <ShopSidebar />
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
