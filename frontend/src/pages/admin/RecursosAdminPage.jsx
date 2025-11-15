import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  FileText,
  Download,
  Upload,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RecursosAdminPage = () => {
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterFase, setFilterFase] = useState('all');
  const [filterPublicado, setFilterPublicado] = useState('all');

  useEffect(() => {
    fetchRecursos();
    fetchStats();
  }, [filterTipo, filterCategoria, filterFase, filterPublicado]);

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({ page: 1, limit: 100 });
      if (filterTipo !== 'all') params.append('tipo', filterTipo);
      if (filterCategoria !== 'all') params.append('categoria', filterCategoria);
      if (filterFase !== 'all') params.append('fase', filterFase);
      if (filterPublicado !== 'all') params.append('publicado', filterPublicado === 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${BACKEND_URL}/api/admin/recursos?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecursos(data.recursos);
      } else {
        toast.error('Error al cargar recursos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/recursos/stats/resumen`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (recursoId, titulo) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${titulo}"?`)) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/recursos/${recursoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Recurso eliminado correctamente');
        fetchRecursos();
        fetchStats();
      } else {
        toast.error('Error al eliminar recurso');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar recurso');
    }
  };

  const getTipoBadgeColor = (tipo) => {
    const colors = {
      guia: 'bg-blue-100 text-blue-800',
      template: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      articulo: 'bg-green-100 text-green-800',
      herramienta: 'bg-yellow-100 text-yellow-800',
      caso_estudio: 'bg-pink-100 text-pink-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecursos = recursos.filter(r =>
    r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Recursos</h1>
            <p className="mt-2 text-gray-600">Administra la biblioteca de contenidos</p>
          </div>
          <Button
            onClick={() => navigate('/admin/recursos/crear')}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Recurso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_recursos}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{stats.publicados}</p>
              </div>
              <Eye className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.borradores}</p>
              </div>
              <Edit className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Destacados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.destacados}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            </div>
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <option value="all">Todos los tipos</option>
            <option value="guia">Guías</option>
            <option value="template">Plantillas</option>
            <option value="video">Videos</option>
            <option value="articulo">Artículos</option>
            <option value="herramienta">Herramientas</option>
            <option value="caso_estudio">Casos de Estudio</option>
          </select>

          <select
            value={filterFase}
            onChange={(e) => setFilterFase(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <option value="all">Todas las fases</option>
            <option value="1">Fase 1</option>
            <option value="2">Fase 2</option>
            <option value="3">Fase 3</option>
            <option value="4">Fase 4</option>
            <option value="5">Fase 5</option>
          </select>

          <select
            value={filterPublicado}
            onChange={(e) => setFilterPublicado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <option value="all">Todos</option>
            <option value="true">Publicados</option>
            <option value="false">Borradores</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#4CAF50]"></div>
            <p className="mt-4 text-gray-600">Cargando recursos...</p>
          </div>
        ) : filteredRecursos.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay recursos</h3>
            <p className="text-gray-600 mb-4">Crea tu primer recurso para comenzar</p>
            <Button
              onClick={() => navigate('/admin/recursos/crear')}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Recurso
            </Button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecursos.map((recurso) => (
                <tr key={recurso.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {recurso.titulo}
                          {recurso.destacado && (
                            <span className="ml-2 text-yellow-500">⭐</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {recurso.descripcion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTipoBadgeColor(recurso.tipo)}`}>
                      {recurso.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recurso.fase_relacionada ? `Fase ${recurso.fase_relacionada}` : 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recurso.acceso_requerido === 'gratuito'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {recurso.acceso_requerido}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {recurso.vistas || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {recurso.descargas || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {recurso.publicado ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Publicado
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => navigate(`/admin/recursos/editar/${recurso.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(recurso.id, recurso.titulo)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default RecursosAdminPage;
