import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextNew";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import LandingPage from "@/pages/LandingPage";
import DiagnosticoPage from "@/pages/DiagnosticoPage";
import LoginPage from "@/pages/LoginPage";
import RegistroPage from "@/pages/RegistroPage";
import TestScoringPage from "@/pages/TestScoringPage";
import TestDuplicateMessage from "@/pages/TestDuplicateMessage";
import TestSupabase from "@/pages/TestSupabase";

// App pages
import ClientDashboard from "@/pages/app/Dashboard";
import RecursosPage from "@/pages/app/RecursosPage";

// Admin pages
import AdminHome from "@/pages/admin/AdminHome";
import AdminContenido from "@/pages/admin/ContenidoPage";

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