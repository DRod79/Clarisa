import React, { useState } from 'react';
import { X, Phone, Mail, Video, CheckSquare, MessageSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextNew';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TIPOS_ACTIVIDAD = [
  { id: 'llamada', nombre: 'Llamada Telefónica', icon: Phone, color: 'blue' },
  { id: 'email', nombre: 'Email', icon: Mail, color: 'purple' },
  { id: 'reunion', nombre: 'Reunión', icon: Video, color: 'green' },
  { id: 'tarea', nombre: 'Tarea', icon: CheckSquare, color: 'orange' },
  { id: 'nota', nombre: 'Nota', icon: MessageSquare, color: 'gray' },
  { id: 'whatsapp', nombre: 'WhatsApp', icon: MessageCircle, color: 'teal' }
];

const NuevaActividadModal = ({ oportunidadId, onClose, onSuccess }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'llamada',
    titulo: '',
    descripcion: '',
    fecha_programada: '',
    hora_programada: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    setLoading(true);

    try {
      // Combinar fecha y hora si están presentes
      let fechaProgramada = null;
      if (formData.fecha_programada) {
        fechaProgramada = formData.fecha_programada;
        if (formData.hora_programada) {
          fechaProgramada = `${formData.fecha_programada}T${formData.hora_programada}:00`;
        } else {
          fechaProgramada = `${formData.fecha_programada}T12:00:00`;
        }
      }

      const actividadData = {
        oportunidad_id: oportunidadId,
        creado_por: userData.id,
        tipo: formData.tipo,
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        fecha_programada: fechaProgramada,
        completada: false
      };

      const response = await fetch(`${API}/sales/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actividadData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        toast.error('Error al crear actividad');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear actividad');
    } finally {
      setLoading(false);
    }
  };

  const tipoSeleccionado = TIPOS_ACTIVIDAD.find(t => t.id === formData.tipo);
  const IconTipo = tipoSeleccionado?.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Actividad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Actividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Actividad *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIPOS_ACTIVIDAD.map((tipo) => {
                const Icon = tipo.icon;
                const isSelected = formData.tipo === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: tipo.id })}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isSelected
                        ? `border-${tipo.color}-500 bg-${tipo.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? `text-${tipo.color}-600` : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${isSelected ? `text-${tipo.color}-900` : 'text-gray-600'}`}>
                      {tipo.nombre}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <div className="relative">
              {IconTipo && (
                <IconTipo className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Ej: ${tipoSeleccionado?.nombre} de seguimiento con el cliente`}
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Detalles adicionales sobre esta actividad..."
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Programada
              </label>
              <input
                type="date"
                value={formData.fecha_programada}
                onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                value={formData.hora_programada}
                onChange={(e) => setFormData({ ...formData, hora_programada: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={!formData.fecha_programada}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Actividad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaActividadModal;
