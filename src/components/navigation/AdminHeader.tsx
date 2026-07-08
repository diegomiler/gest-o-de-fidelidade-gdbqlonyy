import { Link } from 'react-router-dom'
import { Bell, ArrowLeftRight } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AdminHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger />
      <div className="w-px h-6 bg-border mx-2" />
      <Breadcrumb className="hidden sm:block flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Visão Geral</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Visão Cliente
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
