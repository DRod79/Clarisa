import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import AdminLayout from '@/layouts/AdminLayout';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PipelineKanban from '@/components/sales/PipelineKanban';
import StatsCards from '@/components/sales/StatsCards';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PipelinePage = () => {
  const { userData } = useAuth();
  const [oportunidades, setOportunidades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    prioridad: null,
    etapa: null,
    busqueda: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar oportunidades
      const responseOpp = await fetch(`${API}/sales/oportunidades?estado=activo`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (responseOpp.ok) {
        const data = await responseOpp.json();
        setOportunidades(data);
      }

      // Cargar estadísticas
      const responseStats = await fetch(`${API}/sales/stats`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (responseStats.ok) {
        const statsData = await responseStats.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleMoverOportunidad = async (oportunidadId, nuevaEtapa) => {
    try {
      const response = await fetch(`${API}/sales/oportunidades/${oportunidadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          etapa_pipeline: nuevaEtapa
        })
      });

      if (response.ok) {
        toast.success('Oportunidad actualizada');
        cargarDatos();
      } else {
        toast.error('Error al actualizar oportunidad');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar oportunidad');
    }
  };

  const oportunidadesFiltradas = oportunidades.filter(opp => {
    if (filtros.prioridad && opp.prioridad !== filtros.prioridad) return false;
    if (filtros.etapa && opp.etapa_pipeline !== filtros.etapa) return false;
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      return (
        opp.nombre_cliente.toLowerCase().includes(busqueda) ||
        opp.email_cliente.toLowerCase().includes(busqueda) ||
        opp.organizacion?.toLowerCase().includes(busqueda)
      );
    }
    return true;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Pipeline de Ventas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y da seguimiento a tus oportunidades de venta
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/admin/ventas/dashboard'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Dashboard
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => toast.info('Función en desarrollo')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Oportunidad
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, email u organización..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filtros.prioridad || ''}
              onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value || null })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas las prioridades</option>
              <option value="A1">A1 - Máxima</option>
              <option value="A2">A2 - Alta</option>
              <option value="A3">A3 - Alta</option>
              <option value="B1">B1 - Media</option>
              <option value="B2">B2 - Media</option>
              <option value="B3">B3 - Media</option>
              <option value="C1">C1 - Baja</option>
              <option value="C2">C2 - Baja</option>
              <option value="C3">C3 - Baja</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFiltros({ prioridad: null, etapa: null, busqueda: '' })}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <PipelineKanban 
          oportunidades={oportunidadesFiltradas}
          onMoverOportunidad={handleMoverOportunidad}
          onActualizar={cargarDatos}
        />
      </div>
    </AdminLayout>
  );
};

export default PipelinePage;
