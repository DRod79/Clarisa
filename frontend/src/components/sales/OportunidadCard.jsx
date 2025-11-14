import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Building2,
  Mail,
  Clock,
  ExternalLink
} from 'lucide-react';

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

const PRIORIDAD_LABELS = {
  'A1': '🔴 Máxima',
  'A2': '🔴 Alta',
  'A3': '🔴 Alta',
  'B1': '🟡 Media',
  'B2': '🟡 Media',
  'B3': '🟡 Media',
  'C1': '🟢 Baja',
  'C2': '🟢 Baja',
  'C3': '🟢 Baja'
};

const OportunidadCard = ({ oportunidad, onDragStart, onDragEnd, onActualizar, isDragging }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return null;
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const diasDesdeCreacion = () => {
    const creacion = new Date(oportunidad.fecha_creacion);
    const hoy = new Date();
    const diff = Math.floor((hoy - creacion) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, oportunidad)}
      onDragEnd={onDragEnd}
      className={`
        bg-white rounded-lg border-2 border-gray-200 p-4 cursor-move
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
      `}
    >
      {/* Header: Prioridad y Arquetipo */}
      <div className="flex items-start justify-between mb-3">
        <span className={`
          text-xs font-semibold px-2 py-1 rounded-full border
          ${PRIORIDAD_COLORS[oportunidad.prioridad]}
        `}>
          {PRIORIDAD_LABELS[oportunidad.prioridad]}
        </span>
        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
          {oportunidad.arquetipo_niif}
        </span>
      </div>

      {/* Nombre Cliente */}
      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
        {oportunidad.nombre_cliente}
      </h4>

      {/* Organización */}
      {oportunidad.organizacion && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <Building2 className="h-3 w-3" />
          <span className="line-clamp-1">{oportunidad.organizacion}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <Mail className="h-3 w-3" />
        <span className="line-clamp-1">{oportunidad.email_cliente}</span>
      </div>

      {/* Valor y Probabilidad */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-900">
            ${oportunidad.valor_estimado_usd?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {oportunidad.probabilidad_cierre}%
          </span>
        </div>
      </div>

      {/* Footer: Fechas */}
      <div className="space-y-1">
        {oportunidad.fecha_estimada_cierre && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Cierre est: {formatFecha(oportunidad.fecha_estimada_cierre)}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>Hace {diasDesdeCreacion()} días</span>
        </div>
      </div>

      {/* Scoring bars */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-1">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">U</div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: `${oportunidad.scoring_urgencia}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">M</div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${oportunidad.scoring_madurez}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">C</div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${oportunidad.scoring_capacidad}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OportunidadCard;
