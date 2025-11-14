import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Video, 
  CheckSquare, 
  MessageSquare,
  MessageCircle,
  Check,
  Clock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TIPO_ICONS = {
  llamada: Phone,
  email: Mail,
  reunion: Video,
  tarea: CheckSquare,
  nota: MessageSquare,
  whatsapp: MessageCircle
};

const TIPO_COLORS = {
  llamada: 'bg-blue-100 text-blue-600',
  email: 'bg-purple-100 text-purple-600',
  reunion: 'bg-green-100 text-green-600',
  tarea: 'bg-orange-100 text-orange-600',
  nota: 'bg-gray-100 text-gray-600',
  whatsapp: 'bg-teal-100 text-teal-600'
};

const TIPO_LABELS = {
  llamada: 'Llamada',
  email: 'Email',
  reunion: 'Reunión',
  tarea: 'Tarea',
  nota: 'Nota',
  whatsapp: 'WhatsApp'
};

const ActividadesTimeline = ({ actividades, onActualizar }) => {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const handleToggleComplete = async (actividad) => {
    try {
      const response = await fetch(`${API}/sales/actividades/${actividad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completada: !actividad.completada
        })
      });

      if (response.ok) {
        toast.success(actividad.completada ? 'Actividad marcada como pendiente' : 'Actividad completada');
        onActualizar();
      } else {
        toast.error('Error al actualizar actividad');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar actividad');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return null;
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const esProxima = (fecha) => {
    if (!fecha) return false;
    const ahora = new Date();
    const fechaActividad = new Date(fecha);
    const diff = fechaActividad - ahora;
    // Próxima si es en las próximas 24 horas
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const esRetrasada = (fecha, completada) => {
    if (!fecha || completada) return false;
    const ahora = new Date();
    const fechaActividad = new Date(fecha);
    return fechaActividad < ahora;
  };

  if (!actividades || actividades.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay actividades registradas</p>
        <p className="text-sm text-gray-400 mt-2">Crea la primera actividad para comenzar el seguimiento</p>
      </div>
    );
  }

  // Ordenar por fecha más reciente primero
  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const fechaA = new Date(a.fecha_programada || a.created_at);
    const fechaB = new Date(b.fecha_programada || b.created_at);
    return fechaB - fechaA;
  });

  return (
    <div className="space-y-4">
      {actividadesOrdenadas.map((actividad, index) => {
        const Icon = TIPO_ICONS[actividad.tipo];
        const isExpanded = expandedActivity === actividad.id;
        const isRetrasada = esRetrasada(actividad.fecha_programada, actividad.completada);
        const isProxima = esProxima(actividad.fecha_programada);

        return (
          <div 
            key={actividad.id}
            className={`
              relative border-l-4 pl-6 pb-6
              ${actividad.completada 
                ? 'border-green-300 bg-green-50/30' 
                : isRetrasada 
                  ? 'border-red-300 bg-red-50/30'
                  : isProxima
                    ? 'border-yellow-300 bg-yellow-50/30'
                    : 'border-gray-300'
              }
              ${index !== actividadesOrdenadas.length - 1 ? '' : 'pb-0'}
            `}
          >
            {/* Timeline dot */}
            <div className={`
              absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center
              ${TIPO_COLORS[actividad.tipo]}
            `}>
              <Icon className="h-3 w-3" />
            </div>

            {/* Content */}
            <div className="pt-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded-full
                      ${TIPO_COLORS[actividad.tipo]}
                    `}>
                      {TIPO_LABELS[actividad.tipo]}
                    </span>
                    {actividad.completada && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <Check className="h-3 w-3 inline mr-1" />
                        Completada
                      </span>
                    )}
                    {isRetrasada && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Retrasada
                      </span>
                    )}
                    {isProxima && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Próxima
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{actividad.titulo}</h4>
                  {actividad.fecha_programada && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatFecha(actividad.fecha_programada)}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleComplete(actividad)}
                  className={actividad.completada ? 'bg-green-50' : ''}
                >
                  {actividad.completada ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Completada
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Marcar
                    </>
                  )}
                </Button>
              </div>

              {actividad.descripcion && (
                <p className="text-sm text-gray-700 mb-2">{actividad.descripcion}</p>
              )}

              {actividad.resultado && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Resultado:</p>
                  <p className="text-sm text-blue-900">{actividad.resultado}</p>
                </div>
              )}

              {actividad.fecha_completada && (
                <p className="text-xs text-gray-500 mt-2">
                  Completada: {formatFecha(actividad.fecha_completada)}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Creada: {formatFecha(actividad.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActividadesTimeline;
