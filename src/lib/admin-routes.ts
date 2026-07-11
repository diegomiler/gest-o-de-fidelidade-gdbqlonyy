export interface BreadcrumbItem {
  label: string
  path?: string
}

export interface AdminRouteConfig {
  path: string
  title: string
}

export const adminRouteConfigs: AdminRouteConfig[] = [
  { path: '/admin', title: 'Visão Geral' },
  { path: '/admin/vendas', title: 'Vendas' },
  { path: '/admin/banners', title: 'Gestão de Banners' },
  { path: '/admin/campanhas', title: 'Campanhas' },
  { path: '/admin/premios', title: 'Catálogo de Prêmios' },
  { path: '/admin/clientes', title: 'Gestão de Clientes' },
  { path: '/admin/parceiros', title: 'Rede Parceira' },
  { path: '/admin/config', title: 'Configurações API' },
]

const routeAliases: Record<string, string> = {
  '/admin/rewards': '/admin/premios',
}

export function getAdminRouteTitle(pathname: string): string {
  const normalized = routeAliases[pathname] ?? pathname
  const route = adminRouteConfigs.find((r) => r.path === normalized)
  if (route) return route.title

  const segments = normalized.split('/').filter(Boolean)
  if (segments.length >= 3) {
    const parentPath = '/' + segments.slice(0, 2).join('/')
    const parentRoute = adminRouteConfigs.find((r) => r.path === parentPath)
    if (parentRoute) {
      const action = segments[2]?.toLowerCase()
      if (action === 'novo' || action === 'new') return `${parentRoute.title} — Novo Item`
      if (action === 'editar' || action === 'edit') return `${parentRoute.title} — Editar Item`
      return parentRoute.title
    }
  }

  return 'Visão Geral'
}

export function getAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const normalized = routeAliases[pathname] ?? pathname
  const segments = normalized.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: 'Admin', path: '/admin' }]

  if (segments.length <= 1) {
    items.push({ label: 'Visão Geral' })
    return items
  }

  const parentPath = '/' + segments.slice(0, 2).join('/')
  const parentRoute = adminRouteConfigs.find((r) => r.path === parentPath)

  if (!parentRoute) {
    items.push({ label: 'Visão Geral' })
    return items
  }

  if (segments.length === 2) {
    items.push({ label: parentRoute.title })
    return items
  }

  items.push({ label: parentRoute.title, path: parentRoute.path })

  const action = segments[2]?.toLowerCase()
  if (action === 'novo' || action === 'new') {
    items.push({ label: 'Novo Item' })
  } else if (action === 'editar' || action === 'edit') {
    items.push({ label: 'Editar Item' })
  } else {
    items.push({ label: 'Detalhes' })
  }

  return items
}
