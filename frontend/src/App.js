import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import LandingPage from "@/pages/LandingPage";
import DiagnosticoPage from "@/pages/DiagnosticoPage";
import LoginPage from "@/pages/LoginPage";
import RegistroPage from "@/pages/RegistroPage";
import TestScoringPage from "@/pages/TestScoringPage";
import TestDuplicateMessage from "@/pages/TestDuplicateMessage";

// App pages (will be created next)
// import ClientDashboard from "@/pages/app/Dashboard";

// Admin pages (will be created later)
// import AdminHome from "@/pages/admin/Home";

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
            
            {/* Dashboard redirect - will be implemented */}
            <Route 
              path="/dashboard" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard en construcción</h2>
                    <p className="text-gray-600">Próximamente disponible</p>
                  </div>
                </div>
              } 
            />
            
            {/* Client routes - will be protected */}
            {/* <Route 
              path="/app/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['cliente_pagado', 'cliente_gratuito']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            /> */}
            
            {/* Admin routes - will be protected */}
            {/* <Route 
              path="/admin/home" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHome />
                </ProtectedRoute>
              } 
            /> */}
            
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