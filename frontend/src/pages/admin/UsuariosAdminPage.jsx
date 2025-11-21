import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  CreditCard,
  Shield,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UsuariosAdminPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroPlan, setFiltroPlan] = useState('');
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarUsuarios();
  }, [filtroRol, filtroPlan]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      
      let url = `${BACKEND_URL}/api/admin/usuarios?limit=100`;
      
      if (filtroRol) url += `&rol=${filtroRol}`;
      if (filtroPlan) url += `&plan=${filtroPlan}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios || []);
        setTotal(data.total || 0);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarUsuarios();
  };

  const abrirModalEditar = (usuario) => {
    setEditandoUsuario({
      ...usuario,
      nombre_completo: usuario.nombre_completo || '',
      organizacion: usuario.organizacion || '',
      rol: usuario.rol || 'cliente_gratuito',
      plan_actual: usuario.plan_actual || 'gratuito',
      pais: usuario.pais || '',
      puesto: usuario.puesto || '',
      telefono: usuario.telefono || ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoUsuario(null);
  };

  const guardarCambios = async () => {
    if (!editandoUsuario) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/usuarios/${editandoUsuario.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_completo: editandoUsuario.nombre_completo,
            organizacion: editandoUsuario.organizacion,
            rol: editandoUsuario.rol,
            plan_actual: editandoUsuario.plan_actual,
            pais: editandoUsuario.pais,
            puesto: editandoUsuario.puesto,
            telefono: editandoUsuario.telefono
          })
        }
      );
      
      if (response.ok) {
        toast.success('Usuario actualizado exitosamente');
        cerrarModal();
        cargarUsuarios();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const cambiarPlan = async (usuario, nuevoPlan) => {
    if (!confirm(`¿Cambiar el plan de ${usuario.nombre_completo} a ${nuevoPlan}?`)) {
      return;
    }
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/usuarios/${usuario.id}/cambiar-plan`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_actual: nuevoPlan,
            suscripcion_activa: nuevoPlan !== 'gratuito'
          })
        }
      );
      
      if (response.ok) {
        toast.success(`Plan cambiado a ${nuevoPlan} exitosamente`);
        cargarUsuarios();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al cambiar plan');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const desactivarUsuario = async (usuario) => {
    if (!confirm(`¿Estás seguro de desactivar a ${usuario.nombre_completo}?`)) {
      return;
    }
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/usuarios/${usuario.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        toast.success('Usuario desactivado exitosamente');
        cargarUsuarios();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al desactivar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const reactivarUsuario = async (usuario) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/usuarios/${usuario.id}/reactivar`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        toast.success('Usuario reactivado exitosamente');
        cargarUsuarios();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al reactivar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const getRolBadge = (rol) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-800', icon: Shield, label: 'Admin' },
      cliente_pagado: { color: 'bg-green-100 text-green-800', icon: CreditCard, label: 'Pagado' },
      cliente_gratuito: { color: 'bg-gray-100 text-gray-800', icon: User, label: 'Gratuito' }
    };
    
    const badge = badges[rol] || badges.cliente_gratuito;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const colors = {
      gratuito: 'bg-gray-100 text-gray-700',
      basico: 'bg-blue-100 text-blue-700',
      pro: 'bg-purple-100 text-purple-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[plan] || colors.gratuito}`}>
        {plan || 'N/A'}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-600">
              Total: {total} usuario{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={cargarUsuarios}
            className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Filtro Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="cliente_pagado">Pagado</option>
                <option value="cliente_gratuito">Gratuito</option>
              </select>
            </div>

            {/* Filtro Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                value={filtroPlan}
                onChange={(e) => setFiltroPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="gratuito">Gratuito</option>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleBuscar}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white font-semibold">
                            {usuario.nombre_completo?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nombre_completo || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usuario.organizacion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRolBadge(usuario.rol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(usuario.plan_actual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {usuario.suscripcion_activa ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEditar(usuario)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {usuario.suscripcion_activa ? (
                            <button
                              onClick={() => desactivarUsuario(usuario)}
                              className="text-red-600 hover:text-red-900"
                              title="Desactivar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivarUsuario(usuario)}
                              className="text-green-600 hover:text-green-900"
                              title="Reactivar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Información</p>
              <p className="text-sm text-blue-800 mt-1">
                Desde aquí puedes gestionar todos los usuarios de la plataforma. Puedes editar información, cambiar roles y planes, o desactivar usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editar Usuario */}
      {modalAbierto && editandoUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={editandoUsuario.nombre_completo}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, nombre_completo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editandoUsuario.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organización
                    </label>
                    <input
                      type="text"
                      value={editandoUsuario.organizacion}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, organizacion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puesto
                    </label>
                    <input
                      type="text"
                      value={editandoUsuario.puesto}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, puesto: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      value={editandoUsuario.pais}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, pais: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editandoUsuario.telefono}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, telefono: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      value={editandoUsuario.rol}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, rol: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    >
                      <option value="admin">Admin</option>
                      <option value="cliente_pagado">Cliente Pagado</option>
                      <option value="cliente_gratuito">Cliente Gratuito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan *
                    </label>
                    <select
                      value={editandoUsuario.plan_actual}
                      onChange={(e) => setEditandoUsuario({...editandoUsuario, plan_actual: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    >
                      <option value="gratuito">Gratuito</option>
                      <option value="basico">Básico</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  onClick={cerrarModal}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={guardarCambios}
                  className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsuariosAdminPage;
