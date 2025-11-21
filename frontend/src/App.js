import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextNew";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import LandingPage from "@/pages/LandingPage";
import DiagnosticoPage from "@/pages/DiagnosticoPage";
import AccesoPage from "@/pages/AccesoPage";
import LoginPage from "@/pages/LoginPage";
import RegistroPage from "@/pages/RegistroPage";
import TestScoringPage from "@/pages/TestScoringPage";
import TestDuplicateMessage from "@/pages/TestDuplicateMessage";
import TestSupabase from "@/pages/TestSupabase";

// App pages
import ClientDashboard from "@/pages/app/Dashboard";
import RecursosPage from "@/pages/app/RecursosPage";
import MiProgresoPage from "@/pages/app/MiProgresoPage";
import RoadmapPage from "@/pages/app/RoadmapPage";
import AyudaPage from "@/pages/app/AyudaPage";
import SoportePage from "@/pages/app/SoportePage";

// Admin pages
import AdminHome from "@/pages/admin/AdminHome";
import AdminContenido from "@/pages/admin/ContenidoPage";
import PipelinePage from "@/pages/admin/sales/PipelinePage";
import OportunidadDetailPage from "@/pages/admin/sales/OportunidadDetailPage";
import DashboardVentasPage from "@/pages/admin/sales/DashboardVentasPage";
import RecursosAdminPage from "@/pages/admin/RecursosAdminPage";
import CrearRecursoPage from "@/pages/admin/CrearRecursoPage";
import EditarRecursoPage from "@/pages/admin/EditarRecursoPage";
import DashboardEstadisticas from "@/pages/admin/DashboardEstadisticas";
import UsuariosAdminPage from "@/pages/admin/UsuariosAdminPage";
import ReportesAvanzadosPage from "@/pages/admin/ReportesAvanzadosPage";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/diagnostico" element={<DiagnosticoPage />} />
            <Route path="/acceso" element={<AccesoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            
            {/* Test routes (remove in production) */}
            <Route path="/test-scoring" element={<TestScoringPage />} />
            <Route path="/test-duplicate" element={<TestDuplicateMessage />} />
            <Route path="/test-supabase" element={<TestSupabase />} />
            
            {/* Dashboard redirect */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Client routes - protected */}
            <Route 
              path="/app/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/recursos" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <RecursosPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/mi-progreso" 
              element={
                <ProtectedRoute allowedRoles={['cliente_pagado', 'cliente_gratuito']}>
                  <MiProgresoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/roadmap" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <RoadmapPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/ayuda" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <AyudaPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/soporte" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cliente_pagado', 'cliente_gratuito']}>
                  <SoportePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes - protected */}
            <Route 
              path="/admin/home" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/contenido" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminContenido />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ventas" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PipelinePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ventas/oportunidad/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OportunidadDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/ventas/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardVentasPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin - Recursos */}
            <Route 
              path="/admin/recursos" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RecursosAdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/recursos/crear" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CrearRecursoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/recursos/editar/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EditarRecursoPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin - Estadísticas */}
            <Route 
              path="/admin/reportes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardEstadisticas />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin - Usuarios */}
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsuariosAdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin - Reportes Avanzados */}
            <Route 
              path="/admin/reportes-avanzados" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportesAvanzadosPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;