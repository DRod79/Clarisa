import React from 'react';
import { CheckCircle, Circle, Clock, Lock } from 'lucide-react';

const FASES = [
  {
    numero: 1,
    nombre: 'Diagnóstico Inicial',
    descripcion: 'Evaluación de la situación actual',
    icono: '🎯',
    color: 'green'
  },
  {
    numero: 2,
    nombre: 'Análisis de Materialidad',
    descripcion: 'Identificación de temas ESG relevantes',
    icono: '📊',
    color: 'blue'
  },
  {
    numero: 3,
    nombre: 'Identificación de Riesgos',
    descripcion: 'Evaluación de riesgos climáticos',
    icono: '⚠️',
    color: 'orange'
  },
  {
    numero: 4,
    nombre: 'Medición de Huella',
    descripcion: 'Cálculo de emisiones GEI',
    icono: '🌍',
    color: 'purple'
  },
  {
    numero: 5,
    nombre: 'Reporte y Divulgación',
    descripcion: 'Elaboración de informe S1/S2',
    icono: '📄',
    color: 'indigo'
  }
];

const ProgresoTracker = ({ progreso }) => {
  const getFaseStatus = (numero) => {
    const key = `fase${numero}_diagnostico_completado`;
    const porcentajeKey = `fase${numero}_porcentaje`;
    
    if (progreso[key]) {
      return 'completado';
    } else if (progreso[porcentajeKey] > 0) {
      return 'en_progreso';
    } else if (numero === 1 || progreso[`fase${numero - 1}_diagnostico_completado`]) {
      return 'disponible';
    } else {
      return 'bloqueado';
    }
  };

  const getFasePorcentaje = (numero) => {
    const key = `fase${numero}_porcentaje`;
    return progreso[key] || 0;
  };

  const getColorClasses = (color, status) => {
    if (status === 'completado') {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-900',
        icon: 'text-green-600'
      };
    } else if (status === 'en_progreso') {
      const colors = {
        green: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', icon: 'text-green-600' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900', icon: 'text-blue-600' },
        orange: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900', icon: 'text-orange-600' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-900', icon: 'text-purple-600' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-900', icon: 'text-indigo-600' }
      };
      return colors[color];
    } else if (status === 'disponible') {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        text: 'text-gray-900',
        icon: 'text-gray-500'
      };
    } else {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-400',
        icon: 'text-gray-300'
      };
    }
  };

  return (
    <div className="relative">
      {/* Línea de conexión */}
      <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 -z-10 hidden md:block"></div>
      
      {/* Progress bar overlay */}
      <div 
        className="absolute top-8 left-8 h-1 bg-green-500 -z-10 transition-all duration-500 hidden md:block"
        style={{ width: `calc(${(progreso.porcentaje_total / 100) * 100}% - 4rem)` }}
      ></div>

      {/* Fases */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
        {FASES.map((fase) => {
          const status = getFaseStatus(fase.numero);
          const porcentaje = getFasePorcentaje(fase.numero);
          const colors = getColorClasses(fase.color, status);
          
          return (
            <div key={fase.numero} className="relative flex flex-col items-center">
              {/* Círculo de fase */}
              <div className={`
                relative z-10 w-16 h-16 rounded-full border-4 
                ${colors.border} ${colors.bg}
                flex items-center justify-center mb-3
                transition-all duration-300
                ${status === 'en_progreso' ? 'animate-pulse' : ''}
              `}>
                {status === 'completado' && (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                {status === 'en_progreso' && (
                  <Clock className="h-8 w-8 text-blue-600" />
                )}
                {status === 'disponible' && (
                  <Circle className="h-8 w-8 text-gray-400" />
                )}
                {status === 'bloqueado' && (
                  <Lock className="h-6 w-6 text-gray-300" />
                )}
                
                {/* Badge de progreso */}
                {status === 'en_progreso' && (
                  <div className="absolute -bottom-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {porcentaje}%
                  </div>
                )}
              </div>

              {/* Card de información */}
              <div className={`
                w-full p-4 rounded-lg border-2 
                ${colors.border} ${colors.bg}
                transition-all duration-300
                ${status !== 'bloqueado' ? 'hover:shadow-md cursor-pointer' : ''}
              `}>
                {/* Emoji e indicador */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{fase.icono}</span>
                  {status === 'completado' && (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Completado
                    </span>
                  )}
                  {status === 'en_progreso' && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      En progreso
                    </span>
                  )}
                  {status === 'bloqueado' && (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                      Bloqueado
                    </span>
                  )}
                </div>

                {/* Nombre */}
                <h3 className={`font-bold text-sm mb-1 ${colors.text}`}>
                  Fase {fase.numero}: {fase.nombre}
                </h3>

                {/* Descripción */}
                <p className={`text-xs ${status === 'bloqueado' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {fase.descripcion}
                </p>

                {/* Barra de progreso */}
                {porcentaje > 0 && porcentaje < 100 && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${fase.color}-500 transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-gray-600">En progreso</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-300" />
          <span className="text-gray-600">Bloqueado</span>
        </div>
      </div>
    </div>
  );
};

export default ProgresoTracker;
