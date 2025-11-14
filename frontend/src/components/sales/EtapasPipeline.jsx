import React from 'react';

const EtapasPipeline = ({ stats }) => {
  if (!stats || !stats.por_etapa) {
    return <div className="text-center text-gray-500">No hay datos disponibles</div>;
  }

  const ETAPAS = [
    { id: 'nuevo_lead', nombre: 'Nuevo Lead', color: 'bg-gray-400' },
    { id: 'calificado', nombre: 'Calificado', color: 'bg-blue-400' },
    { id: 'contacto_inicial', nombre: 'Contacto Inicial', color: 'bg-indigo-400' },
    { id: 'diagnostico_profundo', nombre: 'Diagnóstico Profundo', color: 'bg-purple-400' },
    { id: 'consultoria_activa', nombre: 'Consultoría Activa', color: 'bg-pink-400' },
    { id: 'preparando_solucion', nombre: 'Preparando Solución', color: 'bg-orange-400' },
    { id: 'negociacion', nombre: 'Negociación', color: 'bg-amber-400' },
    { id: 'cerrado_ganado', nombre: 'Cerrado Ganado', color: 'bg-green-500' },
    { id: 'cerrado_perdido', nombre: 'Cerrado Perdido', color: 'bg-red-500' },
    { id: 'en_nutricion', nombre: 'En Nutrición', color: 'bg-teal-400' }
  ];

  const etapasConDatos = ETAPAS.map(etapa => ({
    ...etapa,
    count: stats.por_etapa[etapa.id] || 0,
    valor: stats.valor_por_etapa?.[etapa.id] || 0
  })).filter(e => e.count > 0);

  const totalOportunidades = etapasConDatos.reduce((sum, e) => sum + e.count, 0);
  const maxValor = Math.max(...etapasConDatos.map(e => e.valor), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Gráfico de barras */}
        <div className="flex items-end justify-between h-64 gap-2 mb-8">
          {etapasConDatos.map((etapa) => {
            const heightPercentage = (etapa.valor / maxValor) * 100;
            const countPercentage = ((etapa.count / totalOportunidades) * 100).toFixed(0);

            return (
              <div key={etapa.id} className="flex-1 flex flex-col items-center">
                {/* Barra */}
                <div className="w-full flex flex-col items-center">
                  {/* Tooltip/Info */}
                  <div className="mb-2 text-center">
                    <div className="text-xs font-semibold text-gray-700">{etapa.count}</div>
                    <div className="text-xs text-gray-500">
                      ${(etapa.valor / 1000).toFixed(0)}K
                    </div>
                  </div>
                  
                  {/* Barra visual */}
                  <div 
                    className={`${etapa.color} w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      {etapa.nombre}
                      <br />
                      {etapa.count} oportunidades
                      <br />
                      ${etapa.valor.toLocaleString('en-US')}
                    </div>
                  </div>
                </div>
                
                {/* Label */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-600 line-clamp-2 h-8">
                    {etapa.nombre}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {countPercentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla resumen */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen por Etapa</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {etapasConDatos.slice(0, 5).map((etapa) => (
              <div key={etapa.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className={`w-3 h-3 ${etapa.color} rounded-full mb-2`}></div>
                <div className="text-xs text-gray-600 mb-1 line-clamp-1">{etapa.nombre}</div>
                <div className="text-lg font-bold text-gray-900">{etapa.count}</div>
                <div className="text-xs text-gray-500">
                  ${(etapa.valor / 1000).toFixed(1)}K
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtapasPipeline;
