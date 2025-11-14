import React from 'react';

const PrioridadDistribution = ({ stats }) => {
  if (!stats || !stats.por_prioridad) {
    return <div className="text-center text-gray-500">No hay datos disponibles</div>;
  }

  const prioridades = [
    { grupo: 'Alta (A)', keys: ['A1', 'A2', 'A3'], color: 'bg-red-500', textColor: 'text-red-900' },
    { grupo: 'Media (B)', keys: ['B1', 'B2', 'B3'], color: 'bg-yellow-500', textColor: 'text-yellow-900' },
    { grupo: 'Baja (C)', keys: ['C1', 'C2', 'C3'], color: 'bg-green-500', textColor: 'text-green-900' }
  ];

  const totales = prioridades.map(p => ({
    ...p,
    count: p.keys.reduce((sum, key) => sum + (stats.por_prioridad[key] || 0), 0)
  }));

  const totalOportunidades = totales.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-4">
      {/* Gráfico de barras horizontales */}
      <div className="space-y-3">
        {totales.map((prioridad) => {
          const percentage = totalOportunidades > 0 
            ? ((prioridad.count / totalOportunidades) * 100).toFixed(1)
            : 0;

          return (
            <div key={prioridad.grupo}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{prioridad.grupo}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{percentage}%</span>
                  <span className="text-sm font-semibold text-gray-900">{prioridad.count}</span>
                </div>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`${prioridad.color} h-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {prioridad.count > 0 && (
                    <span className="text-white text-xs font-semibold">{prioridad.count}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desglose detallado */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-3">Desglose Detallado</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats.por_prioridad).map(([prioridad, count]) => {
            if (count === 0) return null;
            const grupo = prioridad[0]; // A, B, o C
            const colorClass = grupo === 'A' ? 'bg-red-50 border-red-200 text-red-700' :
                              grupo === 'B' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                              'bg-green-50 border-green-200 text-green-700';
            
            return (
              <div key={prioridad} className={`${colorClass} border rounded-lg p-2 text-center`}>
                <div className="text-xs font-semibold">{prioridad}</div>
                <div className="text-lg font-bold">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrioridadDistribution;
