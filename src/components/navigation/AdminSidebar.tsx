import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Image as ImageIcon,
  Megaphone,
  Gift,
  Users,
  Building2,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Vendas', url: '/admin/vendas', icon: Receipt },
  { title: 'Banners', url: '/admin/banners', icon: ImageIcon },
  { title: 'Campanhas', url: '/admin/campanhas', icon: Megaphone },
  { title: 'Prêmios', url: '/admin/premios', icon: Gift },
  { title: 'Clientes', url: '/admin/clientes', icon: Users },
  { title: 'Parceiros', url: '/admin/parceiros', icon: Building2 },
  { title: 'Configurações API', url: '/admin/config', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <Link to="/admin" className="flex items-center gap-2 w-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
            A
          </div>
          <span className="font-bold text-lg">Admin Panel</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
