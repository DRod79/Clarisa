import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';
import { Button } from '@/components/ui/button';
import NotificacionesPanel from '@/components/sales/NotificacionesPanel';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Package,
} from 'lucide-react';

const AdminLayout = ({ children }) => {
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
    { name: 'Dashboard', href: '/admin/home', icon: LayoutDashboard },
    { name: 'Ventas', href: '/admin/ventas', icon: BarChart3 },
    { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
    { name: 'Recursos', href: '/admin/recursos', icon: FileText },
    { name: 'Reportes', href: '/admin/reportes', icon: Package },
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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#2D5F3F] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-[#1e4029]">
            <Link to="/admin/home" className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Clarisa Admin</h1>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Admin info */}
          <div className="p-4 bg-[#1e4029] border-b border-[#4CAF50]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white font-semibold">
                {userData?.nombre_completo?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userData?.nombre_completo || 'Administrador'}
                </p>
                <p className="text-xs text-gray-300">
                  Admin
                </p>
              </div>
            </div>
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
                      : 'text-gray-100 hover:bg-[#3d6e47]'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-[#4CAF50] space-y-2">
            <Link to="/app/dashboard">
              <Button
                variant="outline"
                className="w-full justify-start text-white border-white hover:bg-[#3d6e47]"
              >
                <Package className="w-5 h-5 mr-3" />
                Ver como Cliente
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button
                variant="outline"
                className="w-full justify-start text-white border-white hover:bg-[#3d6e47]"
              >
                <Settings className="w-5 h-5 mr-3" />
                Configuración
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full justify-start text-red-300 border-red-300 hover:bg-red-900 hover:text-white"
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
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#2D5F3F]">Clarisa Admin</h1>
          <NotificacionesPanel />
        </div>
        
        {/* Desktop header con notificaciones */}
        <div className="hidden lg:block sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-end h-16 px-8">
            <NotificacionesPanel />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
