import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SoportePage = () => {
  const { userData } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNuevoTicket, setShowNuevoTicket] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    asunto: '',
    categoria: 'general',
    descripcion: '',
    prioridad: 'normal',
  });

  useEffect(() => {
    if (userData?.id) {
      fetchTickets();
    }
  }, [userData]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/soporte/tickets?user_id=${userData.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTicket = async (e) => {
    e.preventDefault();

    if (!formData.asunto || !formData.descripcion) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/soporte/tickets?user_id=${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Ticket creado correctamente');
        setShowNuevoTicket(false);
        setFormData({
          asunto: '',
          categoria: 'general',
          descripcion: '',
          prioridad: 'normal',
        });
        fetchTickets();
      } else {
        toast.error('Error al crear ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear ticket');
    }
  };

  const handleVerDetalle = async (ticketId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/soporte/tickets/${ticketId}?user_id=${userData.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setTicketSeleccionado(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar detalle');
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();

    if (!nuevoMensaje.trim()) return;

    setEnviandoMensaje(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/soporte/tickets/${ticketSeleccionado.id}/mensajes?user_id=${userData.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: nuevoMensaje }),
        }
      );

      if (response.ok) {
        const mensaje = await response.json();
        setTicketSeleccionado({
          ...ticketSeleccionado,
          mensajes: [...ticketSeleccionado.mensajes, mensaje],
        });
        setNuevoMensaje('');
        toast.success('Mensaje enviado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar mensaje');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      abierto: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Abierto' },
      en_proceso: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En Proceso' },
      resuelto: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resuelto' },
      cerrado: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Cerrado' },
    };
    return badges[estado] || badges.abierto;
  };

  const getPrioridadColor = (prioridad) => {
    const colors = {
      baja: 'text-gray-600',
      normal: 'text-blue-600',
      alta: 'text-orange-600',
      urgente: 'text-red-600',
    };
    return colors[prioridad] || colors.normal;
  };

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎫 Soporte Técnico</h1>
            <p className="mt-2 text-gray-600">Gestiona tus tickets de ayuda</p>
          </div>
          <Button
            onClick={() => setShowNuevoTicket(true)}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ticket
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Abiertos</p>
          <p className="text-2xl font-bold text-blue-600">
            {tickets.filter(t => t.estado === 'abierto').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-600">
            {tickets.filter(t => t.estado === 'en_proceso').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Resueltos</p>
          <p className="text-2xl font-bold text-green-600">
            {tickets.filter(t => t.estado === 'resuelto').length}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#4CAF50]"></div>
            <p className="mt-4 text-gray-600">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes tickets</h3>
            <p className="text-gray-600 mb-4">
              Crea un ticket cuando necesites ayuda con la plataforma
            </p>
            <Button
              onClick={() => setShowNuevoTicket(true)}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Ticket
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => {
              const badge = getEstadoBadge(ticket.estado);
              const IconEstado = badge.icon;

              return (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleVerDetalle(ticket.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.asunto}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${badge.color} flex items-center gap-1`}>
                          <IconEstado className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <span className={`text-xs font-medium ${getPrioridadColor(ticket.prioridad)}`}>
                          {ticket.prioridad.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {ticket.descripcion}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.mensajes_count || 0} mensajes
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                          {ticket.categoria}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Nuevo Ticket */}
      {showNuevoTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</h2>
                <button
                  onClick={() => setShowNuevoTicket(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCrearTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    placeholder="Describe brevemente tu problema"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    >
                      <option value="general">General</option>
                      <option value="tecnico">Técnico</option>
                      <option value="facturacion">Facturación</option>
                      <option value="contenido">Contenido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    >
                      <option value="baja">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                    placeholder="Describe detalladamente tu problema o pregunta..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowNuevoTicket(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  >
                    Crear Ticket
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle Ticket */}
      {ticketSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {ticketSeleccionado.asunto}
                  </h2>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const badge = getEstadoBadge(ticketSeleccionado.estado);
                      const IconEstado = badge.icon;
                      return (
                        <span className={`px-3 py-1 text-sm rounded-full ${badge.color} flex items-center gap-1`}>
                          <IconEstado className="w-4 h-4" />
                          {badge.label}
                        </span>
                      );
                    })()}
                    <span className="text-sm text-gray-600">
                      {new Date(ticketSeleccionado.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setTicketSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Descripción inicial */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticketSeleccionado.descripcion}
                </p>
              </div>

              {/* Mensajes */}
              <div className="space-y-4 mb-6">
                {ticketSeleccionado.mensajes?.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`p-4 rounded-lg ${
                      mensaje.es_staff
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-medium ${
                        mensaje.es_staff ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {mensaje.es_staff ? '👨‍💼 Soporte Clarisa' : '👤 Tú'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(mensaje.created_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{mensaje.mensaje}</p>
                  </div>
                ))}
              </div>

              {/* Responder */}
              {ticketSeleccionado.estado !== 'cerrado' && (
                <form onSubmit={handleEnviarMensaje} className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agregar mensaje
                  </label>
                  <textarea
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] mb-3"
                    placeholder="Escribe tu mensaje..."
                  />
                  <Button
                    type="submit"
                    disabled={enviandoMensaje || !nuevoMensaje.trim()}
                    className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {enviandoMensaje ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default SoportePage;
