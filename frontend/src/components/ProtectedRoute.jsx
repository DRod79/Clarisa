import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando datos de usuario...</p>
        </div>
      </div>
    );
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.rol)) {
    // Redirect to appropriate dashboard based on role
    if (userData.rol === 'admin') {
      return <Navigate to="/admin/home" replace />;
    } else {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
