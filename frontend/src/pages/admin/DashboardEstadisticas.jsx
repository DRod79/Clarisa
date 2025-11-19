import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3,
  Eye
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DashboardEstadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [estadisticasRecursos, setEstadisticasRecursos] = useState(null);
  const [estadisticasSoporte, setEstadisticasSoporte] = useState(null);
  const [estadisticasActividad, setEstadisticasActividad] = useState(null);

  useEffect(() => {
    fetchTodasEstadisticas();
  }, []);

  const fetchTodasEstadisticas = async () => {
    try {
      setLoading(true);
      
      const [generales, recursos, soporte, actividad] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/estadisticas/general`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/admin/estadisticas/recursos`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/admin/estadisticas/soporte`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/admin/estadisticas/actividad`).then(r => r.json())
      ]);

      setEstadisticasGenerales(generales);
      setEstadisticasRecursos(recursos);
      setEstadisticasSoporte(soporte);
      setEstadisticasActividad(actividad);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas y Reportes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Métricas clave del sistema y análisis de uso
            </p>
          </div>
          <button
            onClick={fetchTodasEstadisticas}
            className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Estadísticas Generales */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Usuarios */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {estadisticasGenerales?.total_usuarios || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Activos (mes): {estadisticasGenerales?.usuarios_activos_mes || 0}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            {/* Usuarios por Rol */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Pagados</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {estadisticasGenerales?.usuarios_pagado || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gratuitos: {estadisticasGenerales?.usuarios_gratuito || 0}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </div>

            {/* Total Diagnósticos */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diagnósticos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {estadisticasGenerales?.total_diagnosticos || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Este mes: {estadisticasGenerales?.diagnosticos_mes || 0}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            {/* Total Recursos */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recursos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {estadisticasRecursos?.total_recursos || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Biblioteca completa
                  </p>
                </div>
                <FileText className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad (Última Semana)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Nuevos Usuarios</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {estadisticasActividad?.nuevos_usuarios_semana || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Nuevos Diagnósticos</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {estadisticasActividad?.nuevos_diagnosticos_semana || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">Nuevos Tickets</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {estadisticasActividad?.nuevos_tickets_semana || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Estadísticas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets de Soporte */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-lg font-semibold text-gray-900">Tickets de Soporte</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Tickets</span>
                <span className="text-xl font-bold text-gray-900">
                  {estadisticasSoporte?.total_tickets || 0}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Por Estado</p>
                <div className="space-y-2">
                  {estadisticasSoporte?.tickets_por_estado && 
                    Object.entries(estadisticasSoporte.tickets_por_estado).map(([estado, count]) => (
                      <div key={estado} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">{estado}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Por Prioridad</p>
                <div className="space-y-2">
                  {estadisticasSoporte?.tickets_por_prioridad && 
                    Object.entries(estadisticasSoporte.tickets_por_prioridad).map(([prioridad, count]) => (
                      <div key={prioridad} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">{prioridad}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tickets este mes</span>
                  <span className="font-semibold text-[#4CAF50]">
                    {estadisticasSoporte?.tickets_mes || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-lg font-semibold text-gray-900">Biblioteca de Recursos</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de Recursos</span>
                <span className="text-xl font-bold text-gray-900">
                  {estadisticasRecursos?.total_recursos || 0}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Por Tipo</p>
                <div className="space-y-2">
                  {estadisticasRecursos?.recursos_por_tipo && 
                    Object.entries(estadisticasRecursos.recursos_por_tipo).map(([tipo, count]) => (
                      <div key={tipo} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">{tipo}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Por Fase</p>
                <div className="space-y-2">
                  {estadisticasRecursos?.recursos_por_fase && 
                    Object.entries(estadisticasRecursos.recursos_por_fase).map(([fase, count]) => (
                      <div key={fase} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{fase}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos Más Vistos */}
        {estadisticasRecursos?.recursos_mas_vistos && 
         estadisticasRecursos.recursos_mas_vistos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-lg font-semibold text-gray-900">Recursos Más Vistos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Recurso</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Vistas</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasRecursos.recursos_mas_vistos.map((recurso, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{recurso.titulo}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">
                        {recurso.vistas || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Información</p>
              <p className="text-sm text-blue-800 mt-1">
                Las estadísticas se actualizan en tiempo real. Haz clic en "Actualizar" para obtener los datos más recientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardEstadisticas;
