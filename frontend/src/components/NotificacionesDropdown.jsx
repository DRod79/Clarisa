import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NotificacionesDropdown = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userData?.id) {
      fetchStats();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  useEffect(() => {
    if (isOpen && userData?.id) {
      fetchNotificaciones();
    }
  }, [isOpen, userData]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/notificaciones/stats?user_id=${userData.id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNoLeidas(data.no_leidas);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/notificaciones?user_id=${userData.id}&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotificaciones(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notifId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/notificaciones/${notifId}/marcar-leida?user_id=${userData.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id === notifId ? { ...n, leida: true } : n
        ));
        setNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/notificaciones/marcar-todas-leidas?user_id=${userData.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
        setNoLeidas(0);
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar notificaciones');
    }
  };

  const handleClickNotificacion = (notif) => {
    if (!notif.leida) {
      marcarComoLeida(notif.id);
    }
    
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      nuevo_recurso: '📚',
      fase_completada: '🎉',
      recordatorio: '⏰',
      respuesta_ticket: '💬',
      sistema: 'ℹ️',
      ticket_creado: '🎫',
    };
    return icons[tipo] || '📢';
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifFecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Notificaciones {noLeidas > 0 && `(${noLeidas})`}
            </h3>
            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-sm text-[#4CAF50] hover:text-[#45a049] flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-[#4CAF50]"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-600">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleClickNotificacion(notif)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.leida ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getTipoIcon(notif.tipo)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatearFecha(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-3 border-t text-center">
              <button
                onClick={() => {
                  navigate('/app/notificaciones');
                  setIsOpen(false);
                }}
                className="text-sm text-[#4CAF50] hover:text-[#45a049] font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionesDropdown;
