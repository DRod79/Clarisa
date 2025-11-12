import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { FileText, Users, BarChart3 } from 'lucide-react';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-2 text-gray-600">
          Bienvenido al panel de administración de Clarisa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/admin/contenido')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <FileText className="w-12 h-12 text-[#4CAF50] mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenido</h3>
          <p className="text-gray-600 mb-4">
            Gestiona plantillas, guías y recursos
          </p>
          <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
            Ir a Contenido
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Usuarios</h3>
          <p className="text-gray-600 mb-4">
            Gestiona usuarios y suscripciones
          </p>
          <Button disabled className="w-full">
            Próximamente
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 opacity-50">
          <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Reportes</h3>
          <p className="text-gray-600 mb-4">
            Analytics y estadísticas
          </p>
          <Button disabled className="w-full">
            Próximamente
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
