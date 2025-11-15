import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Download,
  Eye,
  Lock,
  FileText,
  BookOpen,
  Video,
  Wrench,
  Filter,
  Star,
  CheckCircle,
  Award,
  TrendingUp,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RecursosPage = () => {
  const { userData } = useAuth();
  const [recursos, setRecursos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterFase, setFilterFase] = useState('all');
  const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);

  useEffect(() => {
    if (userData?.id) {
      fetchRecursos();
      fetchStats();
    }
  }, [userData, filterTipo, filterCategoria, filterFase]);

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      
      // Construir query params
      const params = new URLSearchParams({
        user_id: userData.id,
        user_rol: userData.rol || 'cliente_gratuito',
      });
      
      if (filterTipo !== 'all') params.append('tipo', filterTipo);
      if (filterCategoria !== 'all') params.append('categoria', filterCategoria);
      if (filterFase !== 'all') params.append('fase', filterFase);
      
      const response = await fetch(
        `${BACKEND_URL}/api/recursos?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setRecursos(data);
      } else {
        toast.error('Error al cargar recursos');
      }
    } catch (error) {
      console.error('Error fetching recursos:', error);
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/recursos/stats/resumen?user_id=${userData.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const canAccess = (accesoRequerido) => {
    const userRol = userData?.rol || 'cliente_gratuito';
    
    if (accesoRequerido === 'gratuito' || accesoRequerido === 'todos') {
      return true;
    }
    
    if (accesoRequerido === 'pagado' && (userRol === 'cliente_pagado' || userRol === 'admin')) {
      return true;
    }
    
    return false;
  };

  const registrarAccion = async (recursoId, accion) => {
    try {
      await fetch(`${BACKEND_URL}/api/recursos/${recursoId}/accion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: accion,
        }),
        credentials: 'include',
      });
      
      // Actualizar stats
      fetchStats();
      fetchRecursos();
    } catch (error) {
      console.error('Error registrando acción:', error);
    }
  };

  const handleView = async (recurso) => {
    if (!canAccess(recurso.acceso_requerido)) {
      toast.error('Este recurso requiere un plan de pago');
      return;
    }

    // Registrar vista
    await registrarAccion(recurso.id, 'visto');
    
    // Abrir modal con detalle
    setRecursoSeleccionado(recurso);
  };

  const handleDownload = async (recurso) => {
    if (!canAccess(recurso.acceso_requerido)) {
      toast.error('Este recurso requiere un plan de pago');
      return;
    }

    if (!recurso.archivo_url) {
      toast.error('Este recurso no tiene archivo disponible');
      return;
    }

    try {
      // Registrar descarga
      await registrarAccion(recurso.id, 'descargado');

      // Abrir archivo
      window.open(recurso.archivo_url, '_blank');
      toast.success('Descargando recurso...');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Error al descargar recurso');
    }
  };

  const handleMarcarCompletado = async (recursoId) => {
    try {
      await registrarAccion(recursoId, 'completado');
      toast.success('¡Recurso marcado como completado!');
    } catch (error) {
      toast.error('Error al marcar como completado');
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'template': return FileText;
      case 'guia': return BookOpen;
      case 'video': return Video;
      case 'herramienta': return Wrench;
      case 'articulo': return FileText;
      case 'caso_estudio': return Award;
      default: return FileText;
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'guia': 'Guía',
      'template': 'Plantilla',
      'video': 'Video',
      'articulo': 'Artículo',
      'herramienta': 'Herramienta',
      'caso_estudio': 'Caso de Estudio',
    };
    return labels[tipo] || tipo;
  };

  const getNivelColor = (nivel) => {
    const colors = {
      'basico': 'bg-green-100 text-green-800',
      'intermedio': 'bg-yellow-100 text-yellow-800',
      'avanzado': 'bg-red-100 text-red-800',
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecursos = recursos.filter(item => {
    const matchSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando recursos...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Recursos</h1>
        <p className="mt-2 text-gray-600">
          Plantillas, guías y herramientas para implementar NIIF S1 y S2
        </p>
      </div>

      {/* User plan info */}
      <div className="bg-gradient-to-r from-[#2D5F3F] to-[#4CAF50] rounded-lg p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Tu plan actual</p>
            <p className="text-xl font-bold capitalize">{userData?.plan_actual || 'Gratuito'}</p>
          </div>
          {userData?.plan_actual === 'gratuito' && (
            <Button 
              onClick={() => window.location.href = '/app/suscripcion'}
              className="bg-white text-[#2D5F3F] hover:bg-gray-100"
            >
              Actualizar Plan
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <option value="all">Todos los tipos</option>
            <option value="plantilla">Plantillas</option>
            <option value="guia">Guías</option>
            <option value="curso">Cursos</option>
            <option value="video">Videos</option>
            <option value="herramienta">Herramientas</option>
          </select>

          {categorias.length > 0 && (
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="all">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      {filteredRecursos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron recursos
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterTipo !== 'all' || filterCategoria !== 'all'
              ? 'Intenta con otros filtros'
              : 'Los recursos estarán disponibles pronto'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecursos.map((recurso) => {
            const Icon = getIconByType(recurso.tipo);
            const hasAccess = canAccess(recurso.nivel_acceso);

            return (
              <div
                key={recurso.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${
                  !hasAccess ? 'opacity-75' : ''
                }`}
              >
                {/* Thumbnail or Icon */}
                <div className="h-48 bg-gradient-to-br from-[#2D5F3F] to-[#4CAF50] flex items-center justify-center">
                  {recurso.thumbnail_url ? (
                    <img
                      src={recurso.thumbnail_url}
                      alt={recurso.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-20 h-20 text-white opacity-80" />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {recurso.tipo}
                    </span>
                    {!hasAccess && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {recurso.titulo}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recurso.descripcion || 'Sin descripción'}
                  </p>

                  {/* Tags */}
                  {recurso.tags && recurso.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recurso.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{recurso.descargas || 0} descargas</span>
                    <span>{recurso.vistas || 0} vistas</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {hasAccess ? (
                      <>
                        <Button
                          onClick={() => handleView(recurso)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          onClick={() => handleDownload(recurso)}
                          className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => window.location.href = '/app/suscripcion'}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Desbloquear con Plan {recurso.nivel_acceso}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ClientLayout>
  );
};

export default RecursosPage;
