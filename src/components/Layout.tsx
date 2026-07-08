import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from './navigation/AdminSidebar'
import { AdminHeader } from './navigation/AdminHeader'
import { ConsumerHeader } from './navigation/ConsumerHeader'
import { ConsumerBottomNav } from './navigation/ConsumerBottomNav'

export default function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50">
          <AdminSidebar />
          <SidebarInset className="bg-slate-50 flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-16 md:pb-0">
      <ConsumerHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        <Outlet />
      </main>
      <ConsumerBottomNav />
    </div>
  )
}
