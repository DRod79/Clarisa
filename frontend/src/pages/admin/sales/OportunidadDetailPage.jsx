import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  User,
  Clock,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActividadesTimeline from '@/components/sales/ActividadesTimeline';
import NuevaActividadModal from '@/components/sales/NuevaActividadModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ETAPAS = [
  { id: 'nuevo_lead', nombre: 'Nuevo Lead' },
  { id: 'calificado', nombre: 'Calificado' },
  { id: 'contacto_inicial', nombre: 'Contacto Inicial' },
  { id: 'diagnostico_profundo', nombre: 'Diagnóstico Profundo' },
  { id: 'consultoria_activa', nombre: 'Consultoría Activa' },
  { id: 'preparando_solucion', nombre: 'Preparando Solución' },
  { id: 'negociacion', nombre: 'Negociación' },
  { id: 'cerrado_ganado', nombre: 'Cerrado Ganado' },
  { id: 'cerrado_perdido', nombre: 'Cerrado Perdido' },
  { id: 'en_nutricion', nombre: 'En Nutrición' }
];

const PRIORIDAD_COLORS = {
  'A1': 'bg-red-100 text-red-800 border-red-300',
  'A2': 'bg-red-50 text-red-700 border-red-200',
  'A3': 'bg-orange-50 text-orange-700 border-orange-200',
  'B1': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'B2': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'B3': 'bg-amber-50 text-amber-700 border-amber-200',
  'C1': 'bg-green-100 text-green-800 border-green-300',
  'C2': 'bg-green-50 text-green-700 border-green-200',
  'C3': 'bg-teal-50 text-teal-700 border-teal-200'
};

const OportunidadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oportunidad, setOportunidad] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar oportunidad
      const responseOpp = await fetch(`${API}/sales/oportunidades/${id}`);
      if (responseOpp.ok) {
        const data = await responseOpp.json();
        setOportunidad(data);
        setFormData({
          etapa_pipeline: data.etapa_pipeline,
          valor_estimado_usd: data.valor_estimado_usd,
          probabilidad_cierre: data.probabilidad_cierre,
          fecha_estimada_cierre: data.fecha_estimada_cierre,
          proxima_accion: data.proxima_accion || '',
          notas: data.notas || ''
        });
      }

      // Cargar actividades
      const responseAct = await fetch(`${API}/sales/oportunidades/${id}/actividades`);
      if (responseAct.ok) {
        const actData = await responseAct.json();
        setActividades(actData);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API}/sales/oportunidades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Oportunidad actualizada');
        setEditMode(false);
        cargarDatos();
      } else {
        toast.error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleActividadCreada = () => {
    setShowNewActivityModal(false);
    cargarDatos();
    toast.success('Actividad creada');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!oportunidad) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Oportunidad no encontrada</p>
          <Button onClick={() => navigate('/admin/ventas')} className="mt-4">
            Volver al Pipeline
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/ventas')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{oportunidad.nombre_cliente}</h1>
              <p className="text-gray-600">{oportunidad.organizacion}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Valor Estimado</span>
            </div>
            {editMode ? (
              <input
                type="number"
                value={formData.valor_estimado_usd}
                onChange={(e) => setFormData({ ...formData, valor_estimado_usd: parseFloat(e.target.value) })}
                className="text-2xl font-bold w-full border border-gray-300 rounded px-2"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${oportunidad.valor_estimado_usd?.toLocaleString('en-US')}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Probabilidad</span>
            </div>
            {editMode ? (
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probabilidad_cierre}
                onChange={(e) => setFormData({ ...formData, probabilidad_cierre: parseInt(e.target.value) })}
                className="text-2xl font-bold w-full border border-gray-300 rounded px-2"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{oportunidad.probabilidad_cierre}%</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">Cierre Estimado</span>
            </div>
            {editMode ? (
              <input
                type="date"
                value={formData.fecha_estimada_cierre || ''}
                onChange={(e) => setFormData({ ...formData, fecha_estimada_cierre: e.target.value })}
                className="text-sm font-medium w-full border border-gray-300 rounded px-2 py-1"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">
                {oportunidad.fecha_estimada_cierre 
                  ? new Date(oportunidad.fecha_estimada_cierre).toLocaleDateString('es-ES')
                  : 'No definida'}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Prioridad</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${PRIORIDAD_COLORS[oportunidad.prioridad]}`}>
              {oportunidad.prioridad}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Información General</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Etapa del Pipeline</label>
                  {editMode ? (
                    <select
                      value={formData.etapa_pipeline}
                      onChange={(e) => setFormData({ ...formData, etapa_pipeline: e.target.value })}
                      className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      {ETAPAS.map(etapa => (
                        <option key={etapa.id} value={etapa.id}>{etapa.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-medium">
                      {ETAPAS.find(e => e.id === oportunidad.etapa_pipeline)?.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{oportunidad.email_cliente}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Organización</span>
                  </div>
                  <p className="font-medium">{oportunidad.organizacion || 'No especificada'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Arquetipo NIIF</span>
                  </div>
                  <p className="font-medium font-mono">{oportunidad.arquetipo_niif}</p>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Scoring del Diagnóstico</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Urgencia</span>
                    <span className="text-sm font-semibold">{oportunidad.scoring_urgencia}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${oportunidad.scoring_urgencia}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Madurez</span>
                    <span className="text-sm font-semibold">{oportunidad.scoring_madurez}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${oportunidad.scoring_madurez}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Capacidad</span>
                    <span className="text-sm font-semibold">{oportunidad.scoring_capacidad}/100</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${oportunidad.scoring_capacidad}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Notas</h3>
              {editMode ? (
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Agregar notas..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {oportunidad.notas || 'Sin notas'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Actividades y Seguimiento</h3>
                <Button
                  onClick={() => setShowNewActivityModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Actividad
                </Button>
              </div>
              
              <ActividadesTimeline 
                actividades={actividades}
                onActualizar={cargarDatos}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Actividad */}
      {showNewActivityModal && (
        <NuevaActividadModal
          oportunidadId={id}
          onClose={() => setShowNewActivityModal(false)}
          onSuccess={handleActividadCreada}
        />
      )}
    </AdminLayout>
  );
};

export default OportunidadDetailPage;
