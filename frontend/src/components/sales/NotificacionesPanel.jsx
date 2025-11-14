import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NotificacionesPanel = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarNotificaciones, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las oportunidades activas
      const responseOpp = await fetch(`${API}/sales/oportunidades?estado=activo`);
      if (!responseOpp.ok) return;
      
      const oportunidades = await responseOpp.json();
      
      // Obtener todas las actividades
      const todasActividades = [];
      for (const opp of oportunidades) {
        const responseAct = await fetch(`${API}/sales/oportunidades/${opp.id}/actividades`);
        if (responseAct.ok) {
          const actividades = await responseAct.json();
          todasActividades.push(...actividades.map(a => ({
            ...a,
            oportunidad: opp
          })));
        }
      }
      
      // Filtrar actividades pendientes
      const ahora = new Date();
      const actividadesPendientes = todasActividades.filter(a => !a.completada);
      
      const notifs = [];
      
      // Actividades retrasadas
      const retrasadas = actividadesPendientes.filter(a => {
        if (!a.fecha_programada) return false;
        return new Date(a.fecha_programada) < ahora;
      });
      
      retrasadas.forEach(a => {
        notifs.push({
          id: `retrasada-${a.id}`,
          tipo: 'retrasada',
          titulo: 'Actividad Retrasada',
          mensaje: a.titulo,
          oportunidad: a.oportunidad.nombre_cliente,
          oportunidad_id: a.oportunidad.id,
          fecha: a.fecha_programada,
          icono: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        });
      });
      
      // Actividades próximas (en las próximas 24 horas)
      const proximas = actividadesPendientes.filter(a => {
        if (!a.fecha_programada) return false;
        const fechaActividad = new Date(a.fecha_programada);
        const diff = fechaActividad - ahora;
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
      });
      
      proximas.forEach(a => {
        notifs.push({
          id: `proxima-${a.id}`,
          tipo: 'proxima',
          titulo: 'Actividad Próxima',
          mensaje: a.titulo,
          oportunidad: a.oportunidad.nombre_cliente,
          oportunidad_id: a.oportunidad.id,
          fecha: a.fecha_programada,
          icono: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        });
      });
      
      // Oportunidades de alta prioridad sin actividades recientes
      const sinActividad = oportunidades.filter(opp => {
        const esAltaPrioridad = opp.prioridad.startsWith('A');
        const actividades = todasActividades.filter(a => a.oportunidad_id === opp.id);
        const tieneActividadesRecientes = actividades.some(a => {
          const diffDias = (ahora - new Date(a.created_at)) / (1000 * 60 * 60 * 24);
          return diffDias < 7;
        });
        return esAltaPrioridad && !tieneActividadesRecientes;
      });
      
      sinActividad.forEach(opp => {
        notifs.push({
          id: `sin-actividad-${opp.id}`,
          tipo: 'sin_actividad',
          titulo: 'Requiere Seguimiento',
          mensaje: `${opp.nombre_cliente} (Prioridad ${opp.prioridad})`,
          oportunidad: opp.nombre_cliente,
          oportunidad_id: opp.id,
          icono: Bell,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        });
      });
      
      // Ordenar por urgencia
      notifs.sort((a, b) => {
        const orden = { retrasada: 1, proxima: 2, sin_actividad: 3 };
        return orden[a.tipo] - orden[b.tipo];
      });
      
      setNotificaciones(notifs);
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificacionClick = (notif) => {
    navigate(`/admin/ventas/oportunidad/${notif.oportunidad_id}`);
    setShowPanel(false);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const notificacionesCount = notificaciones.length;

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {notificacionesCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {notificacionesCount > 9 ? '9+' : notificacionesCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Notificaciones
                {notificacionesCount > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({notificacionesCount})
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">No hay notificaciones</p>
                  <p className="text-sm text-gray-400 mt-1">Todo está al día</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => {
                    const Icono = notif.icono;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificacionClick(notif)}
                        className={`
                          p-4 hover:bg-gray-50 cursor-pointer transition
                          ${notif.bgColor} border-l-4 
                          ${notif.tipo === 'retrasada' ? 'border-red-500' : 
                            notif.tipo === 'proxima' ? 'border-yellow-500' : 
                            'border-orange-500'}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <Icono className={`h-5 w-5 mt-0.5 ${notif.color}`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {notif.titulo}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {notif.mensaje}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notif.oportunidad}
                            </p>
                            {notif.fecha && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                <Calendar className="h-3 w-3" />
                                {formatFecha(notif.fecha)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificaciones.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cargarNotificaciones}
                  className="w-full"
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesPanel;
