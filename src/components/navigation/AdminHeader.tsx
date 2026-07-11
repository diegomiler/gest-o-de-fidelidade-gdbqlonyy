import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeftRight } from 'lucide-react'
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
import { getAdminBreadcrumbs } from '@/lib/admin-routes'

export function AdminHeader() {
  const location = useLocation()
  const breadcrumbs = getAdminBreadcrumbs(location.pathname)
  const currentLabel = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Visão Geral'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger />
      <div className="w-px h-6 bg-border mx-2" />

      <Breadcrumb className="hidden sm:block flex-1 min-w-0">
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className="min-w-0">
                  {isLast || !item.path ? (
                    <BreadcrumbPage className="font-normal text-foreground truncate">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.path}
                        className="font-normal text-foreground truncate hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <span className="sm:hidden flex-1 min-w-0 font-normal text-foreground truncate text-sm">
        {currentLabel}
      </span>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Visão Cliente</span>
            <span className="md:hidden">Cliente</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
