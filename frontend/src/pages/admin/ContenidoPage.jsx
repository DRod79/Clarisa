import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  BookOpen,
  Video,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const ContenidoPage = () => {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterNivel, setFilterNivel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchContenidos();
  }, []);

  const fetchContenidos = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contenido?order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContenidos(data);
      }
    } catch (error) {
      console.error('Error fetching contenidos:', error);
      toast.error('Error al cargar contenidos');
    } finally {
      setLoading(false);
    }
  };

  const deleteContenido = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este contenido?')) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (response.ok || response.status === 204) {
        toast.success('Contenido eliminado');
        fetchContenidos();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting contenido:', error);
      toast.error('Error al eliminar contenido');
    }
  };

  const togglePublicado = async (id, currentStatus) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ publicado: !currentStatus })
      });

      if (response.ok || response.status === 204) {
        toast.success(currentStatus ? 'Contenido despublicado' : 'Contenido publicado');
        fetchContenidos();
      }
    } catch (error) {
      console.error('Error toggling publicado:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const filteredContenidos = contenidos.filter(item => {
    const matchSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'all' || item.tipo === filterTipo;
    const matchNivel = filterNivel === 'all' || item.nivel_acceso === filterNivel;
    return matchSearch && matchTipo && matchNivel;
  });

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'plantilla': return FileText;
      case 'guia': return BookOpen;
      case 'video': return Video;
      case 'herramienta': return Tool;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando contenidos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contenido</h1>
        <p className="mt-2 text-gray-600">
          Administra plantillas, guías, videos y herramientas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Contenidos</p>
          <p className="text-2xl font-bold text-gray-900">{contenidos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Publicados</p>
          <p className="text-2xl font-bold text-[#4CAF50]">
            {contenidos.filter(c => c.publicado).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Borradores</p>
          <p className="text-2xl font-bold text-orange-500">
            {contenidos.filter(c => !c.publicado).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Descargas</p>
          <p className="text-2xl font-bold text-blue-500">
            {contenidos.reduce((sum, c) => sum + (c.descargas || 0), 0)}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            </div>

            {/* Filters */}
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="all">Todos los tipos</option>
              <option value="plantilla">Plantillas</option>
              <option value="guia">Guías</option>
              <option value="curso">Cursos</option>
              <option value="articulo">Artículos</option>
              <option value="video">Videos</option>
              <option value="herramienta">Herramientas</option>
            </select>

            <select
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="all">Todos los niveles</option>
              <option value="gratuito">Gratuito</option>
              <option value="basico">Básico</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Contenido
          </Button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contenido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContenidos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay contenidos disponibles</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  >
                    Crear primer contenido
                  </Button>
                </td>
              </tr>
            ) : (
              filteredContenidos.map((item) => {
                const Icon = getIconByType(item.tipo);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#4CAF50] bg-opacity-10 rounded flex items-center justify-center mr-3">
                          <Icon className="w-5 h-5 text-[#4CAF50]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.titulo}</p>
                          <p className="text-xs text-gray-500">{item.descripcion?.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.nivel_acceso === 'gratuito' ? 'bg-gray-100 text-gray-800' :
                        item.nivel_acceso === 'pro' ? 'bg-[#4CAF50] text-white' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.nivel_acceso}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{item.descargas || 0} descargas</span>
                        <span>{item.vistas || 0} vistas</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublicado(item.id, item.publicado)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          item.publicado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {item.publicado ? 'Publicado' : 'Borrador'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteContenido(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Crear Nuevo Contenido</h2>
            <p className="text-gray-600 mb-4">Modal de creación (implementando siguiente...)</p>
            <Button onClick={() => setShowCreateModal(false)}>Cerrar</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContenidoPage;
