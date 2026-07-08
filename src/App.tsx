import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Layout from './components/Layout'
import NotFound from './pages/NotFound'

import ConsumerDashboard from './pages/consumer/Dashboard'
import ConsumerStatement from './pages/consumer/Statement'
import ConsumerRewards from './pages/consumer/Rewards'
import ConsumerProfile from './pages/consumer/Profile'

import AdminDashboard from './pages/admin/Dashboard'
import AdminSales from './pages/admin/Sales'
import AdminBanners from './pages/admin/Banners'
import AdminCampaigns from './pages/admin/Campaigns'
import AdminRewards from './pages/admin/Rewards'
import AdminCustomers from './pages/admin/Customers'
import AdminPartners from './pages/admin/Partners'
import AdminConfig from './pages/admin/Config'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ConsumerDashboard />} />
          <Route path="/extrato" element={<ConsumerStatement />} />
          <Route path="/premios" element={<ConsumerRewards />} />
          <Route path="/perfil" element={<ConsumerProfile />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vendas" element={<AdminSales />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/campanhas" element={<AdminCampaigns />} />
          <Route path="/admin/premios" element={<AdminRewards />} />
          <Route path="/admin/clientes" element={<AdminCustomers />} />
          <Route path="/admin/parceiros" element={<AdminPartners />} />
          <Route path="/admin/config" element={<AdminConfig />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
