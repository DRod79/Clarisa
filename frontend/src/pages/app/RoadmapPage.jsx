import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import {
  CheckCircle,
  Circle,
  Lock,
  TrendingUp,
  Calendar,
  Target,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RoadmapPage = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [progreso, setProgreso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      fetchProgreso();
    }
  }, [userData]);

  const fetchProgreso = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/progreso/${userData.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setProgreso(data);
      } else {
        toast.error('Error al cargar progreso');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar progreso');
    } finally {
      setLoading(false);
    }
  };

  const fases = [
    {
      numero: 1,
      nombre: 'Diagnóstico Inicial',
      descripcion: 'Evalúa el estado actual de tu organización',
      color: 'blue',
      duracion: '2-4 semanas',
      recursos_clave: ['Guía de Diagnóstico', 'Template de Autoevaluación'],
    },
    {
      numero: 2,
      nombre: 'Análisis de Materialidad',
      descripcion: 'Identifica temas ESG materiales para tu negocio',
      color: 'purple',
      duracion: '3-6 semanas',
      recursos_clave: ['Guía de Materialidad', 'Matriz de Materialidad'],
    },
    {
      numero: 3,
      nombre: 'Identificación de Riesgos',
      descripcion: 'Evalúa riesgos climáticos físicos y de transición',
      color: 'orange',
      duracion: '2-4 semanas',
      recursos_clave: ['Guía de Riesgos', 'Matriz de Riesgos'],
    },
    {
      numero: 4,
      nombre: 'Medición y Cálculo',
      descripcion: 'Calcula tu huella de carbono y métricas clave',
      color: 'green',
      duracion: '4-8 semanas',
      recursos_clave: ['Guía de Huella de Carbono', 'Calculadora GEI'],
    },
    {
      numero: 5,
      nombre: 'Reporte y Divulgación',
      descripcion: 'Prepara y publica tus reportes NIIF S1/S2',
      color: 'indigo',
      duracion: '4-6 semanas',
      recursos_clave: ['Template NIIF S1', 'Template NIIF S2'],
    },
  ];

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700',
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700',
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700',
      green: active ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700',
      indigo: active ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700',
    };
    return colors[color] || colors.blue;
  };

  const calcularProgresoPorFase = (numeroFase) => {
    if (!progreso || !progreso.fases) return 0;
    
    const fase = progreso.fases.find(f => f.numero_fase === numeroFase);
    if (!fase) return 0;
    
    const completadas = fase.acciones_completadas || 0;
    const totales = fase.acciones_totales || 1;
    
    return Math.round((completadas / totales) * 100);
  };

  const esFaseBloqueada = (numeroFase) => {
    if (!progreso) return true;
    
    // Fase 1 siempre desbloqueada
    if (numeroFase === 1) return false;
    
    // Verificar si la fase anterior está completada al menos al 70%
    const faseAnterior = progreso.fases?.find(f => f.numero_fase === numeroFase - 1);
    if (!faseAnterior) return true;
    
    const completadas = faseAnterior.acciones_completadas || 0;
    const totales = faseAnterior.acciones_totales || 1;
    const progresoAnterior = (completadas / totales) * 100;
    
    return progresoAnterior < 70;
  };

  const calcularFechaEstimada = (numeroFase) => {
    const duraciones = [4, 6, 4, 8, 6]; // semanas por fase
    let semanasAcumuladas = 0;
    
    for (let i = 0; i < numeroFase; i++) {
      semanasAcumuladas += duraciones[i];
    }
    
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + (semanasAcumuladas * 7));
    
    return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#4CAF50]"></div>
            <p className="mt-4 text-gray-600">Cargando roadmap...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const faseActual = progreso?.fase_actual || 1;
  const progresoTotal = progreso?.progreso_total || 0;

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🗺️ Tu Roadmap NIIF</h1>
        <p className="mt-2 text-gray-600">
          Sigue tu progreso a través de las 5 fases de implementación
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-[#2D5F3F] to-[#4CAF50] rounded-lg p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <p className="text-sm opacity-90">Progreso Total</p>
            </div>
            <p className="text-4xl font-bold">{progresoTotal}%</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-sm opacity-90">Fase Actual</p>
            </div>
            <p className="text-4xl font-bold">Fase {faseActual}</p>
            <p className="text-sm opacity-90 mt-1">{fases[faseActual - 1]?.nombre}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <p className="text-sm opacity-90">Finalización Estimada</p>
            </div>
            <p className="text-2xl font-bold">{calcularFechaEstimada(5)}</p>
            <p className="text-sm opacity-90 mt-1">Basado en progreso actual</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {fases.map((fase, index) => {
          const progresoDeFase = calcularProgresoPorFase(fase.numero);
          const estaCompletada = progresoDeFase === 100;
          const esActual = fase.numero === faseActual;
          const estaBloqueada = esFaseBloqueada(fase.numero);

          return (
            <div
              key={fase.numero}
              className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                esActual ? 'ring-2 ring-[#4CAF50]' : ''
              } ${estaBloqueada && !esActual ? 'opacity-60' : ''}`}
            >
              {/* Color Bar */}
              <div className={`h-2 ${getColorClasses(fase.color, true)}`} />

              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                    estaCompletada
                      ? 'bg-green-500 text-white'
                      : estaBloqueada
                      ? 'bg-gray-300 text-gray-500'
                      : getColorClasses(fase.color, true)
                  }`}>
                    {estaCompletada ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : estaBloqueada ? (
                      <Lock className="w-8 h-8" />
                    ) : (
                      <span className="text-2xl font-bold">{fase.numero}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {fase.nombre}
                          {esActual && (
                            <span className="ml-3 text-sm font-normal px-3 py-1 bg-[#4CAF50] text-white rounded-full">
                              En progreso
                            </span>
                          )}
                          {estaCompletada && (
                            <span className="ml-3 text-sm font-normal px-3 py-1 bg-green-500 text-white rounded-full">
                              ✓ Completada
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600">{fase.descripcion}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {progresoDeFase}%
                        </div>
                        <p className="text-sm text-gray-500">{fase.duracion}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getColorClasses(fase.color, true)}`}
                          style={{ width: `${progresoDeFase}%` }}
                        />
                      </div>
                    </div>

                    {/* Recursos Clave */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recursos clave:</p>
                      <div className="flex flex-wrap gap-2">
                        {fase.recursos_clave.map((recurso, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {recurso}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!estaBloqueada && (
                        <>
                          <Button
                            onClick={() => navigate('/app/mi-progreso')}
                            variant="outline"
                            size="sm"
                          >
                            Ver Progreso Detallado
                          </Button>
                          <Button
                            onClick={() => navigate('/app/recursos')}
                            className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                            size="sm"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Ir a Recursos
                          </Button>
                        </>
                      )}
                      {estaBloqueada && (
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Completa la fase anterior al 70% para desbloquear
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < fases.length - 1 && (
                <div className="absolute left-14 bottom-0 w-0.5 h-6 bg-gray-300 transform translate-y-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Achievement Banner */}
      {progresoTotal >= 80 && (
        <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <Award className="w-12 h-12" />
            <div>
              <h3 className="text-2xl font-bold mb-1">¡Excelente Progreso!</h3>
              <p className="opacity-90">
                Has completado más del 80% de tu implementación NIIF. ¡Sigue así!
              </p>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default RoadmapPage;
