import React from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

const TIMELINE_STEPS = [
  {
    fase: 1,
    steps: [
      { id: 1, nombre: 'Completar diagnóstico inicial', puntos: 100 },
      { id: 2, nombre: 'Revisar resultados del diagnóstico', puntos: 0 },
      { id: 3, nombre: 'Identificar tu arquetipo NIIF', puntos: 0 }
    ]
  },
  {
    fase: 2,
    steps: [
      { id: 1, nombre: 'Consultar guía de materialidad', puntos: 5 },
      { id: 2, nombre: 'Identificar stakeholders clave', puntos: 15 },
      { id: 3, nombre: 'Usar matriz de materialidad', puntos: 20 },
      { id: 4, nombre: 'Priorizar temas ESG', puntos: 25 },
      { id: 5, nombre: 'Documentar resultados', puntos: 35 }
    ]
  },
  {
    fase: 3,
    steps: [
      { id: 1, nombre: 'Consultar guía de riesgos climáticos', puntos: 5 },
      { id: 2, nombre: 'Identificar riesgos físicos', puntos: 20 },
      { id: 3, nombre: 'Identificar riesgos de transición', puntos: 20 },
      { id: 4, nombre: 'Evaluar impactos financieros', puntos: 30 },
      { id: 5, nombre: 'Definir estrategias de mitigación', puntos: 25 }
    ]
  },
  {
    fase: 4,
    steps: [
      { id: 1, nombre: 'Usar calculadora de huella de carbono', puntos: 20 },
      { id: 2, nombre: 'Recopilar datos de emisiones Scope 1', puntos: 20 },
      { id: 3, nombre: 'Recopilar datos de emisiones Scope 2', puntos: 20 },
      { id: 4, nombre: 'Recopilar datos de emisiones Scope 3', puntos: 20 },
      { id: 5, nombre: 'Calcular huella total', puntos: 20 }
    ]
  },
  {
    fase: 5,
    steps: [
      { id: 1, nombre: 'Descargar template de reporte', puntos: 10 },
      { id: 2, nombre: 'Completar sección de gobernanza', puntos: 20 },
      { id: 3, nombre: 'Completar sección de estrategia', puntos: 20 },
      { id: 4, nombre: 'Completar sección de gestión de riesgos', puntos: 20 },
      { id: 5, nombre: 'Completar métricas y objetivos', puntos: 20 },
      { id: 6, nombre: 'Revisar y publicar reporte', puntos: 10 }
    ]
  }
];

const FASE_NOMBRES = {
  1: 'Fase 1: Diagnóstico Inicial',
  2: 'Fase 2: Análisis de Materialidad',
  3: 'Fase 3: Identificación de Riesgos',
  4: 'Fase 4: Medición de Huella',
  5: 'Fase 5: Reporte y Divulgación'
};

const TimelineDetallado = ({ progreso }) => {
  const isFaseCompletada = (fase) => {
    const key = `fase${fase}_diagnostico_completado`;
    return progreso[key];
  };

  const getFasePorcentaje = (fase) => {
    const key = `fase${fase}_porcentaje`;
    return progreso[key] || 0;
  };

  return (
    <div className="space-y-8">
      {TIMELINE_STEPS.map((faseData) => {
        const faseCompletada = isFaseCompletada(faseData.fase);
        const porcentaje = getFasePorcentaje(faseData.fase);
        const faseActiva = porcentaje > 0 && porcentaje < 100;

        return (
          <div key={faseData.fase} className="relative">
            {/* Header de fase */}
            <div className={`
              flex items-center gap-3 mb-4 pb-3 border-b-2
              ${faseCompletada ? 'border-green-500' : faseActiva ? 'border-blue-500' : 'border-gray-200'}
            `}>
              {faseCompletada ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : faseActiva ? (
                <div className="relative">
                  <Circle className="h-6 w-6 text-blue-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
              
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${
                  faseCompletada ? 'text-green-900' : 
                  faseActiva ? 'text-blue-900' : 
                  'text-gray-600'
                }`}>
                  {FASE_NOMBRES[faseData.fase]}
                </h3>
                {faseCompletada && (
                  <p className="text-sm text-green-600">Completada ✓</p>
                )}
                {faseActiva && (
                  <p className="text-sm text-blue-600">En progreso - {porcentaje}%</p>
                )}
              </div>

              {porcentaje > 0 && (
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{porcentaje}%</span>
                  <p className="text-xs text-gray-500">Progreso</p>
                </div>
              )}
            </div>

            {/* Steps de la fase */}
            <div className="pl-9 space-y-3">
              {faseData.steps.map((step, index) => {
                // Estimación simple: el paso está completado si el porcentaje supera su umbral
                const umbralStep = (step.puntos / 100) * 100;
                const stepCompletado = porcentaje >= umbralStep;
                const stepActivo = !stepCompletado && (index === 0 || porcentaje >= ((faseData.steps[index - 1]?.puntos || 0) / 100) * 100);

                return (
                  <div 
                    key={step.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg transition-all
                      ${stepCompletado ? 'bg-green-50 border-l-4 border-green-500' : 
                        stepActivo ? 'bg-blue-50 border-l-4 border-blue-500' : 
                        'bg-gray-50 border-l-4 border-gray-200'}
                    `}
                  >
                    <div className="mt-0.5">
                      {stepCompletado ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : stepActivo ? (
                        <ChevronRight className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        stepCompletado ? 'text-green-900' : 
                        stepActivo ? 'text-blue-900' : 
                        'text-gray-600'
                      }`}>
                        {step.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        +{step.puntos} puntos
                      </p>
                    </div>

                    {stepCompletado && (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Completado
                      </span>
                    )}
                    {stepActivo && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        En curso
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineDetallado;
