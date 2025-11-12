import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Users,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, user } = useAuth();
  const [diagnostico, setDiagnostico] = useState(null);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch diagnostico
      const { data: diagData } = await supabase
        .from('diagnosticos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (diagData) {
        setDiagnostico(diagData);
      }

      // Fetch tareas pendientes
      const { data: tareasData } = await supabase
        .from('tareas')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'pendiente')
        .order('fecha_limite', { ascending: true })
        .limit(5);

      if (tareasData) {
        setTareasPendientes(tareasData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {userData?.nombre_completo?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          {userData?.organizacion && `${userData.organizacion} • `}
          {userData?.pais}
        </p>
      </div>

      {/* Alert if no diagnostico */}
      {!diagnostico && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Comienza con tu diagnóstico
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Realiza el diagnóstico NIIF S1/S2 para obtener tu perfil de preparación y recomendaciones personalizadas.
              </p>
              <div className="mt-3">
                <Button
                  onClick={() => navigate('/diagnostico')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Hacer diagnóstico ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress card */}
          {diagnostico && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tu progreso en implementación S1/S2
              </h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progreso general
                  </span>
                  <span className="text-sm font-semibold text-[#4CAF50]">
                    {userData?.progreso_general || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#4CAF50] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${userData?.progreso_general || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <MilestoneItem
                  completed={true}
                  title="Diagnóstico completado"
                  date="Completado"
                />
                <MilestoneItem
                  completed={false}
                  active={true}
                  title="Análisis de materialidad"
                  date="En progreso"
                />
                <MilestoneItem
                  completed={false}
                  title="Identificación de riesgos"
                  date="Pendiente"
                />
                <MilestoneItem
                  completed={false}
                  title="Medición huella de carbono"
                  date="Pendiente"
                />
                <MilestoneItem
                  completed={false}
                  title="Reporte S1/S2"
                  date="Pendiente"
                />
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => navigate('/app/mi-progreso')}
                  className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  Ver hoja de ruta completa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Recursos recomendados */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recursos recomendados para ti
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate('/app/recursos')}
                className="text-sm"
              >
                Ver todos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceCard
                icon={FileText}
                type="Plantilla"
                title="Matriz de Materialidad"
                description="Identifica tus temas materiales"
                isLocked={userData?.plan_actual === 'gratuito'}
              />
              <ResourceCard
                icon={BookOpen}
                type="Guía"
                title="Introducción a NIIF S1"
                description="Conceptos básicos y aplicación"
                isLocked={false}
              />
              <ResourceCard
                icon={FileText}
                type="Plantilla"
                title="Calculadora de Emisiones"
                description="Calcula tu huella de carbono"
                isLocked={userData?.plan_actual === 'gratuito'}
              />
              <ResourceCard
                icon={BookOpen}
                type="Guía"
                title="Gestión de Riesgos Climáticos"
                description="Framework completo"
                isLocked={false}
              />
            </div>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Perfil de preparación */}
          {diagnostico && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tu perfil de preparación
              </h3>
              
              <div className="mb-4 p-4 bg-[#4CAF50] bg-opacity-10 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Arquetipo</p>
                <p className="text-lg font-bold text-[#2D5F3F]">
                  {diagnostico.arquetipo}
                </p>
              </div>

              <div className="space-y-3">
                <DimensionBar
                  label="Urgencia"
                  value={diagnostico.urgencia_puntos || 0}
                  color="red"
                />
                <DimensionBar
                  label="Madurez"
                  value={diagnostico.madurez_puntos || 0}
                  color="blue"
                />
                <DimensionBar
                  label="Capacidad"
                  value={diagnostico.capacidad_puntos || 0}
                  color="green"
                />
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/diagnostico')}
              >
                Ver reporte completo
              </Button>
            </div>
          )}

          {/* Tareas pendientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Próximas tareas
              </h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>

            {tareasPendientes.length > 0 ? (
              <div className="space-y-3">
                {tareasPendientes.map((tarea) => (
                  <TaskItem key={tarea.id} tarea={tarea} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay tareas pendientes</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/app/mi-progreso')}
            >
              Ver todas las tareas
            </Button>
          </div>

          {/* Upgrade card for free users */}
          {userData?.plan_actual === 'gratuito' && (
            <div className="bg-gradient-to-br from-[#2D5F3F] to-[#4CAF50] rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Desbloquea más contenido
              </h3>
              <p className="text-sm text-white text-opacity-90 mb-4">
                Accede a plantillas premium, herramientas y soporte prioritario
              </p>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  50+ plantillas premium
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Herramientas interactivas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Soporte prioritario
                </li>
              </ul>
              <Button
                className="w-full bg-white text-[#2D5F3F] hover:bg-gray-100"
                onClick={() => navigate('/app/suscripcion')}
              >
                Ver planes
              </Button>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

// Helper components
const MilestoneItem = ({ completed, active, title, date }) => (
  <div className="flex items-start">
    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
      completed ? 'bg-[#4CAF50]' :
      active ? 'bg-blue-500' :
      'bg-gray-300'
    }`}>
      {completed ? (
        <CheckCircle className="w-4 h-4 text-white" />
      ) : (
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-gray-500'}`} />
      )}
    </div>
    <div className="ml-3 flex-1">
      <p className={`text-sm font-medium ${completed || active ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </p>
      <p className="text-xs text-gray-500">{date}</p>
    </div>
  </div>
);

const DimensionBar = ({ label, value, color }) => {
  const colors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-[#4CAF50]',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

const ResourceCard = ({ icon: Icon, type, title, description, isLocked }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#4CAF50] transition-colors cursor-pointer">
    <div className="flex items-start justify-between mb-2">
      <div className="w-10 h-10 rounded-lg bg-[#4CAF50] bg-opacity-10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#4CAF50]" />
      </div>
      {isLocked && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          Premium
        </span>
      )}
    </div>
    <span className="text-xs text-gray-500">{type}</span>
    <h4 className="text-sm font-semibold text-gray-900 mt-1">{title}</h4>
    <p className="text-xs text-gray-600 mt-1">{description}</p>
  </div>
);

const TaskItem = ({ tarea }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
    <input
      type="checkbox"
      className="mt-1 h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{tarea.titulo}</p>
      {tarea.fecha_limite && (
        <p className="text-xs text-gray-500 mt-1">
          Vence: {new Date(tarea.fecha_limite).toLocaleDateString('es-ES')}
        </p>
      )}
    </div>
  </div>
);

export default Dashboard;
