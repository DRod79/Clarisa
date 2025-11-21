import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';
import { Button } from '@/components/ui/button';
import NotificacionesDropdown from '@/components/NotificacionesDropdown';
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Map,
  HelpCircle,
  MessageSquare,
  Heart,
} from 'lucide-react';

const ClientLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: Home },
    { name: 'Mi Progreso', href: '/app/mi-progreso', icon: TrendingUp },
    { name: 'Roadmap', href: '/app/roadmap', icon: Map },
    { name: 'Recursos', href: '/app/recursos', icon: BookOpen },
    { name: 'Favoritos', href: '/app/favoritos', icon: Heart },
    { name: 'Ayuda', href: '/app/ayuda', icon: HelpCircle },
    { name: 'Soporte', href: '/app/soporte', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/app/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-[#2D5F3F]">Clarisa</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white font-semibold">
                {userData?.nombre_completo?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.nombre_completo || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userData?.email}
                </p>
              </div>
            </div>
            {userData?.plan_actual && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.plan_actual === 'pro' ? 'bg-[#4CAF50] text-white' :
                  userData.plan_actual === 'basico' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Plan {userData.plan_actual.charAt(0).toUpperCase() + userData.plan_actual.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#4CAF50] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t space-y-2">
            <Link to="/app/suscripcion">
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Suscripción
              </Button>
            </Link>
            <Link to="/app/perfil">
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Settings className="w-5 h-5 mr-3" />
                Configuración
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header - visible only on large screens */}
        <div className="hidden lg:block sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-end h-16 px-6">
            <NotificacionesDropdown />
          </div>
        </div>

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#2D5F3F]">Clarisa</h1>
          <NotificacionesDropdown />
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
