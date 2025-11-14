import React from 'react';

const ConversionFunnel = ({ oportunidades }) => {
  const ETAPAS_FUNNEL = [
    { id: 'nuevo_lead', nombre: 'Nuevos Leads', color: 'bg-gray-400' },
    { id: 'calificado', nombre: 'Calificados', color: 'bg-blue-400' },
    { id: 'contacto_inicial', nombre: 'Contacto Inicial', color: 'bg-indigo-400' },
    { id: 'diagnostico_profundo', nombre: 'Diagnóstico', color: 'bg-purple-400' },
    { id: 'consultoria_activa', nombre: 'Consultoría', color: 'bg-pink-400' },
    { id: 'preparando_solucion', nombre: 'Solución', color: 'bg-orange-400' },
    { id: 'negociacion', nombre: 'Negociación', color: 'bg-amber-400' },
    { id: 'cerrado_ganado', nombre: 'Cerrados', color: 'bg-green-500' }
  ];

  const contarPorEtapa = (etapaId) => {
    return oportunidades.filter(o => o.etapa_pipeline === etapaId).length;
  };

  const maxCount = Math.max(...ETAPAS_FUNNEL.map(e => contarPorEtapa(e.id)), 1);

  return (
    <div className="space-y-2">
      {ETAPAS_FUNNEL.map((etapa, index) => {
        const count = contarPorEtapa(etapa.id);
        const percentage = (count / maxCount) * 100;
        const displayPercentage = maxCount > 0 ? ((count / contarPorEtapa(ETAPAS_FUNNEL[0].id)) * 100).toFixed(0) : 0;

        return (
          <div key={etapa.id} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{etapa.nombre}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{displayPercentage}%</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div 
                className={`${etapa.color} h-full transition-all duration-500 flex items-center justify-center`}
                style={{ width: `${percentage}%` }}
              >
                {count > 0 && (
                  <span className="text-white text-xs font-semibold">{count}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversionFunnel;
