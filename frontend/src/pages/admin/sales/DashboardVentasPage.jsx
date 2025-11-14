import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/sales/MetricCard';
import ConversionFunnel from '@/components/sales/ConversionFunnel';
import PrioridadDistribution from '@/components/sales/PrioridadDistribution';
import EtapasPipeline from '@/components/sales/EtapasPipeline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardVentasPage = () => {
  const [stats, setStats] = useState(null);
  const [oportunidades, setOportunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes'); // mes, trimestre, año

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const responseStats = await fetch(`${API}/sales/stats`);
      if (responseStats.ok) {
        const statsData = await responseStats.json();
        setStats(statsData);
      }

      // Cargar todas las oportunidades para análisis
      const responseOpp = await fetch(`${API}/sales/oportunidades`);
      if (responseOpp.ok) {
        const oppData = await responseOpp.json();
        setOportunidades(oppData);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = () => {
    if (!oportunidades.length) return null;

    const activas = oportunidades.filter(o => o.estado === 'activo');
    const ganadas = oportunidades.filter(o => o.estado === 'ganado');
    const perdidas = oportunidades.filter(o => o.estado === 'perdido');

    const tasaConversion = activas.length > 0 
      ? ((ganadas.length / (ganadas.length + perdidas.length)) * 100).toFixed(1)
      : 0;

    const valorGanado = ganadas.reduce((sum, o) => sum + (o.valor_estimado_usd || 0), 0);
    const ticketPromedio = ganadas.length > 0 
      ? (valorGanado / ganadas.length).toFixed(0)
      : 0;

    const prioridadAlta = activas.filter(o => o.prioridad.startsWith('A')).length;
    
    // Calcular tendencia (simulada - en producción compararías con período anterior)
    const tendenciaValor = 12.5; // +12.5%
    const tendenciaConversion = -2.3; // -2.3%

    return {
      totalActivas: activas.length,
      totalGanadas: ganadas.length,
      totalPerdidas: perdidas.length,
      tasaConversion,
      valorGanado,
      ticketPromedio,
      prioridadAlta,
      tendenciaValor,
      tendenciaConversion
    };
  };

  const metricas = calcularMetricas();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Ventas</h1>
            <p className="text-gray-600 mt-1">
              Análisis completo del rendimiento y métricas del pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="año">Este año</option>
              <option value="todo">Todo el tiempo</option>
            </select>
            <Button
              onClick={cargarDatos}
              variant="outline"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Oportunidades Activas"
              value={metricas.totalActivas}
              icon={Activity}
              color="blue"
              subtitle={`${metricas.prioridadAlta} de alta prioridad`}
            />
            <MetricCard
              title="Tasa de Conversión"
              value={`${metricas.tasaConversion}%`}
              icon={Target}
              color="green"
              trend={metricas.tendenciaConversion}
              subtitle={metricas.tendenciaConversion > 0 ? 'Mejorando' : 'Necesita atención'}
            />
            <MetricCard
              title="Valor Ganado"
              value={`$${metricas.valorGanado.toLocaleString('en-US')}`}
              icon={DollarSign}
              color="purple"
              trend={metricas.tendenciaValor}
              subtitle={`${metricas.totalGanadas} deals cerrados`}
            />
            <MetricCard
              title="Ticket Promedio"
              value={`$${metricas.ticketPromedio.toLocaleString('en-US')}`}
              icon={TrendingUp}
              color="orange"
              subtitle="Por oportunidad ganada"
            />
          </div>
        )}

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Embudo de Conversión */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Embudo de Conversión
              </h3>
            </div>
            <ConversionFunnel oportunidades={oportunidades} />
          </div>

          {/* Distribución por Prioridad */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Distribución por Prioridad
              </h3>
            </div>
            <PrioridadDistribution stats={stats} />
          </div>
        </div>

        {/* Pipeline por Etapa */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Pipeline por Etapa
            </h3>
          </div>
          <EtapasPipeline stats={stats} />
        </div>

        {/* Insights y Recomendaciones */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Insights y Recomendaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricas && metricas.prioridadAlta > 0 && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">🔴 Prioridad Alta</p>
                <p className="text-xs text-gray-600">
                  Tienes {metricas.prioridadAlta} oportunidades de alta prioridad que requieren atención inmediata
                </p>
              </div>
            )}
            {metricas && metricas.tasaConversion < 30 && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">⚠️ Tasa de Conversión</p>
                <p className="text-xs text-gray-600">
                  Tu tasa de conversión está por debajo del promedio. Considera mejorar el seguimiento
                </p>
              </div>
            )}
            {stats && stats.total_oportunidades > 5 && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">✅ Pipeline Saludable</p>
                <p className="text-xs text-gray-600">
                  Tu pipeline tiene {stats.total_oportunidades} oportunidades activas. Mantén el ritmo de seguimiento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardVentasPage;
