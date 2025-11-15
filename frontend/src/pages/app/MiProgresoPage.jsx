import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  Circle,
  TrendingUp,
  Calendar,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgresoTracker from '@/components/progreso/ProgresoTracker';
import TimelineDetallado from '@/components/progreso/TimelineDetallado';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MiProgresoPage = () => {
  const { userData } = useAuth();
  const [progreso, setProgreso] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (userData?.id) {
      cargarProgreso();
    }
  }, [userData]);

  const cargarProgreso = async () => {
    try {
      setLoading(true);
      
      // Cargar progreso
      const responseProgreso = await fetch(`${API}/progreso/${userData.id}`);
      if (responseProgreso.ok) {
        const dataProgreso = await responseProgreso.json();
        setProgreso(dataProgreso);
      } else if (responseProgreso.status === 404) {
        // Inicializar si no existe
        const initResponse = await fetch(`${API}/progreso/${userData.id}/inicializar`, {
          method: 'POST'
        });
        if (initResponse.ok) {
          const dataInit = await initResponse.json();
          setProgreso(dataInit);
        }
      }

      // Cargar estadísticas
      const responseStats = await fetch(`${API}/progreso/${userData.id}/estadisticas`);
      if (responseStats.ok) {
        const dataStats = await responseStats.json();
        setEstadisticas(dataStats);
      }

    } catch (error) {
      console.error('Error cargando progreso:', error);
      toast.error('Error al cargar tu progreso');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ClientLayout>
    );
  }

  if (!progreso) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">No se pudo cargar tu progreso</p>
          <Button onClick={cargarProgreso} className="mt-4">
            Reintentar
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>
          <p className="text-gray-600 mt-1">
            Seguimiento de tu implementación NIIF S1/S2
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fases Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.fases_completadas || 0}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.fases_en_progreso || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Puntos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.puntos_totales || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progreso Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progreso.porcentaje_total}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ruta de Implementación S1/S2</h2>
              <p className="text-sm text-gray-600 mt-1">
                Avanza paso a paso en tu camino hacia la sostenibilidad
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? 'Vista Compacta' : 'Ver Hoja de Ruta Completa'}
              <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${showTimeline ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          <ProgresoTracker progreso={progreso} />
        </div>

        {/* Timeline Detallado */}
        {showTimeline && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hoja de Ruta Detallada</h2>
            <TimelineDetallado progreso={progreso} />
          </div>
        )}

        {/* Tips y Recomendaciones */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Próximos Pasos Recomendados
          </h3>
          <div className="space-y-3">
            {progreso.fase1_completado && !progreso.fase2_completado && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">📋 Fase 2: Análisis de Materialidad</p>
                <p className="text-xs text-gray-600">
                  Identifica los temas ESG más relevantes para tu organización. Consulta recursos disponibles en la biblioteca.
                </p>
              </div>
            )}
            {!progreso.fase1_completado && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">🎯 Comienza aquí</p>
                <p className="text-xs text-gray-600">
                  Completa el diagnóstico inicial para entender tu situación actual y desbloquear recursos personalizados.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = '/diagnostico'}
                >
                  Ir al Diagnóstico
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default MiProgresoPage;
