import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Download, 
  FileText, 
  Users, 
  MessageSquare,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReportesAvanzadosPage = () => {
  const [tipoReporte, setTipoReporte] = useState('usuarios');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtrosAdicionales, setFiltrosAdicionales] = useState({});
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previsualizacion, setPrevisualizacion] = useState(null);
  const [mostrandoPreview, setMostrandoPreview] = useState(false);

  useEffect(() => {
    cargarResumen();
    
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(haceUnMes.toISOString().split('T')[0]);
  }, []);

  const cargarResumen = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/reportes/resumen`);
      if (response.ok) {
        const data = await response.json();
        setResumen(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generarVistaPrevia = async () => {
    try {
      setLoading(true);
      setPrevisualizacion(null);
      setMostrandoPreview(false);
      
      let url = '';
      let endpoint = '';
      
      // Construir URL según tipo de reporte
      if (tipoReporte === 'usuarios') {
        endpoint = `${BACKEND_URL}/api/admin/usuarios?limit=100`;
        if (filtrosAdicionales.rol) endpoint += `&rol=${filtrosAdicionales.rol}`;
        if (filtrosAdicionales.plan) endpoint += `&plan=${filtrosAdicionales.plan}`;
        if (fechaDesde) endpoint += `&fecha_desde=${fechaDesde}`;
        if (fechaHasta) endpoint += `&fecha_hasta=${fechaHasta}`;
      } else if (tipoReporte === 'recursos') {
        endpoint = `${BACKEND_URL}/api/admin/reportes/recursos/export?formato=json`;
        if (filtrosAdicionales.tipo) endpoint += `&tipo=${filtrosAdicionales.tipo}`;
        if (filtrosAdicionales.fase) endpoint += `&fase=${filtrosAdicionales.fase}`;
        if (filtrosAdicionales.acceso) endpoint += `&acceso=${filtrosAdicionales.acceso}`;
      } else if (tipoReporte === 'tickets') {
        endpoint = `${BACKEND_URL}/api/admin/reportes/tickets/export?formato=json`;
        if (filtrosAdicionales.estado) endpoint += `&estado=${filtrosAdicionales.estado}`;
        if (filtrosAdicionales.prioridad) endpoint += `&prioridad=${filtrosAdicionales.prioridad}`;
        if (filtrosAdicionales.categoria) endpoint += `&categoria=${filtrosAdicionales.categoria}`;
        if (fechaDesde) endpoint += `&fecha_desde=${fechaDesde}`;
        if (fechaHasta) endpoint += `&fecha_hasta=${fechaHasta}`;
      }
      
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        
        // Formatear datos según el tipo
        let datosFormateados = [];
        if (tipoReporte === 'usuarios') {
          datosFormateados = (data.usuarios || []).map(u => ({
            Email: u.email,
            Nombre: u.nombre_completo || 'N/A',
            Organización: u.organizacion || 'N/A',
            Rol: u.rol,
            Plan: u.plan_actual,
            Estado: u.suscripcion_activa ? 'Activo' : 'Inactivo',
            Registro: new Date(u.created_at).toLocaleDateString('es-ES')
          }));
        }
        
        setPrevisualizacion({
          tipo: tipoReporte,
          datos: datosFormateados,
          total: datosFormateados.length
        });
        setMostrandoPreview(true);
        toast.success(`${datosFormateados.length} registros cargados`);
      } else {
        toast.error('Error al cargar vista previa');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = async () => {
    try {
      setLoading(true);
      
      let url = `${BACKEND_URL}/api/admin/reportes/${tipoReporte}/export?formato=csv`;
      
      // Agregar filtros según el tipo de reporte
      if (tipoReporte === 'usuarios') {
        if (filtrosAdicionales.rol) url += `&rol=${filtrosAdicionales.rol}`;
        if (filtrosAdicionales.plan) url += `&plan=${filtrosAdicionales.plan}`;
        if (fechaDesde) url += `&fecha_desde=${fechaDesde}`;
        if (fechaHasta) url += `&fecha_hasta=${fechaHasta}`;
      } else if (tipoReporte === 'recursos') {
        if (filtrosAdicionales.tipo) url += `&tipo=${filtrosAdicionales.tipo}`;
        if (filtrosAdicionales.fase) url += `&fase=${filtrosAdicionales.fase}`;
        if (filtrosAdicionales.acceso) url += `&acceso=${filtrosAdicionales.acceso}`;
      } else if (tipoReporte === 'tickets') {
        if (filtrosAdicionales.estado) url += `&estado=${filtrosAdicionales.estado}`;
        if (filtrosAdicionales.prioridad) url += `&prioridad=${filtrosAdicionales.prioridad}`;
        if (filtrosAdicionales.categoria) url += `&categoria=${filtrosAdicionales.categoria}`;
        if (fechaDesde) url += `&fecha_desde=${fechaDesde}`;
        if (fechaHasta) url += `&fecha_hasta=${fechaHasta}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reporte_${tipoReporte}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success('Reporte descargado exitosamente');
      } else {
        toast.error('Error al descargar reporte');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderFiltrosAdicionales = () => {
    switch (tipoReporte) {
      case 'usuarios':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={filtrosAdicionales.rol || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, rol: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="cliente_pagado">Pagado</option>
                <option value="cliente_gratuito">Gratuito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan
              </label>
              <select
                value={filtrosAdicionales.plan || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, plan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="gratuito">Gratuito</option>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
        );
      
      case 'recursos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filtrosAdicionales.tipo || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="articulo">Artículo</option>
                <option value="guia">Guía</option>
                <option value="video">Video</option>
                <option value="template">Plantilla</option>
                <option value="webinar">Webinar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fase
              </label>
              <select
                value={filtrosAdicionales.fase || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, fase: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="1">Fase 1</option>
                <option value="2">Fase 2</option>
                <option value="3">Fase 3</option>
                <option value="4">Fase 4</option>
                <option value="5">Fase 5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acceso
              </label>
              <select
                value={filtrosAdicionales.acceso || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, acceso: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="gratuito">Gratuito</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>
          </div>
        );
      
      case 'tickets':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtrosAdicionales.estado || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={filtrosAdicionales.prioridad || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, prioridad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filtrosAdicionales.categoria || ''}
                onChange={(e) => setFiltrosAdicionales({...filtrosAdicionales, categoria: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="tecnico">Técnico</option>
                <option value="contenido">Contenido</option>
                <option value="facturacion">Facturación</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes Avanzados</h1>
          <p className="mt-1 text-sm text-gray-600">
            Genera y descarga reportes personalizados en formato CSV
          </p>
        </div>

        {/* Resumen de Datos Disponibles */}
        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Usuarios</p>
                  <p className="text-2xl font-bold text-blue-900">{resumen.total_usuarios}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-900 font-medium">Recursos</p>
                  <p className="text-2xl font-bold text-green-900">{resumen.total_recursos}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-900 font-medium">Tickets</p>
                  <p className="text-2xl font-bold text-orange-900">{resumen.total_tickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-900 font-medium">Diagnósticos</p>
                  <p className="text-2xl font-bold text-purple-900">{resumen.total_diagnosticos}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generador de Reportes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-[#4CAF50]" />
            <h2 className="text-xl font-semibold text-gray-900">Generar Reporte</h2>
          </div>

          <div className="space-y-6">
            {/* Tipo de Reporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Reporte *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setTipoReporte('usuarios');
                    setFiltrosAdicionales({});
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    tipoReporte === 'usuarios'
                      ? 'border-[#4CAF50] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${
                    tipoReporte === 'usuarios' ? 'text-[#4CAF50]' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">Usuarios</p>
                  <p className="text-xs text-gray-600 mt-1">Lista completa de usuarios</p>
                </button>

                <button
                  onClick={() => {
                    setTipoReporte('recursos');
                    setFiltrosAdicionales({});
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    tipoReporte === 'recursos'
                      ? 'border-[#4CAF50] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${
                    tipoReporte === 'recursos' ? 'text-[#4CAF50]' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">Recursos</p>
                  <p className="text-xs text-gray-600 mt-1">Biblioteca de recursos</p>
                </button>

                <button
                  onClick={() => {
                    setTipoReporte('tickets');
                    setFiltrosAdicionales({});
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    tipoReporte === 'tickets'
                      ? 'border-[#4CAF50] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${
                    tipoReporte === 'tickets' ? 'text-[#4CAF50]' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">Tickets</p>
                  <p className="text-xs text-gray-600 mt-1">Soporte y tickets</p>
                </button>
              </div>
            </div>

            {/* Rango de Fechas (solo para usuarios y tickets) */}
            {(tipoReporte === 'usuarios' || tipoReporte === 'tickets') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Rango de Fechas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Desde</label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filtros Adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filtros Adicionales
              </label>
              {renderFiltrosAdicionales()}
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                onClick={generarVistaPrevia}
                disabled={loading}
                variant="outline"
                className="border-[#4CAF50] text-[#4CAF50] hover:bg-green-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4CAF50] border-t-transparent mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Datos
                  </>
                )}
              </Button>
              
              <Button
                onClick={descargarReporte}
                disabled={loading || !mostrandoPreview}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Acerca de los reportes</p>
              <p className="text-sm text-blue-800 mt-1">
                Los reportes se generan en tiempo real con los datos actuales de la base de datos. 
                Puedes usar los filtros para personalizar la información exportada. Los archivos CSV 
                pueden abrirse con Excel, Google Sheets u otras herramientas de análisis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportesAvanzadosPage;
