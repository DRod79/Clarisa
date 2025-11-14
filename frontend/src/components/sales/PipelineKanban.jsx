import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Leaf
} from 'lucide-react';
import OportunidadCard from './OportunidadCard';

const ETAPAS = [
  {
    id: 'nuevo_lead',
    nombre: 'Nuevo Lead',
    color: 'bg-gray-100 border-gray-300',
    icon: AlertCircle,
    descripcion: 'Recién diagnosticado'
  },
  {
    id: 'calificado',
    nombre: 'Calificado',
    color: 'bg-blue-50 border-blue-300',
    icon: CheckCircle,
    descripcion: 'Prioridad validada'
  },
  {
    id: 'contacto_inicial',
    nombre: 'Contacto Inicial',
    color: 'bg-indigo-50 border-indigo-300',
    icon: Phone,
    descripcion: 'Primer acercamiento'
  },
  {
    id: 'diagnostico_profundo',
    nombre: 'Diagnóstico Profundo',
    color: 'bg-purple-50 border-purple-300',
    icon: MessageSquare,
    descripcion: 'Entendiendo necesidades'
  },
  {
    id: 'consultoria_activa',
    nombre: 'Consultoría Activa',
    color: 'bg-yellow-50 border-yellow-300',
    icon: Mail,
    descripcion: 'Asesoramiento en curso'
  },
  {
    id: 'preparando_solucion',
    nombre: 'Preparando Solución',
    color: 'bg-orange-50 border-orange-300',
    icon: Calendar,
    descripcion: 'Definiendo plan'
  },
  {
    id: 'negociacion',
    nombre: 'Negociación',
    color: 'bg-amber-50 border-amber-300',
    icon: DollarSign,
    descripcion: 'Ajustando términos'
  },
  {
    id: 'cerrado_ganado',
    nombre: 'Cerrado Ganado',
    color: 'bg-green-50 border-green-300',
    icon: CheckCircle,
    descripcion: 'Cliente convertido'
  },
  {
    id: 'en_nutricion',
    nombre: 'En Nutrición',
    color: 'bg-teal-50 border-teal-300',
    icon: Leaf,
    descripcion: 'Recursos gratuitos'
  }
];

const PipelineKanban = ({ oportunidades, onMoverOportunidad, onActualizar }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, oportunidad) => {
    setDraggedItem(oportunidad);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    // Add opacity to dragged item
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, etapaId) => {
    e.preventDefault();
    setDragOverColumn(etapaId);
  };

  const handleDragLeave = (e, etapaId) => {
    // Only remove highlight if leaving the column container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, etapaId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedItem && draggedItem.etapa_pipeline !== etapaId) {
      await onMoverOportunidad(draggedItem.id, etapaId);
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const getOportunidadesPorEtapa = (etapaId) => {
    return oportunidades.filter(opp => opp.etapa_pipeline === etapaId);
  };

  const calcularValorEtapa = (etapaId) => {
    const opps = getOportunidadesPorEtapa(etapaId);
    return opps.reduce((sum, opp) => sum + (opp.valor_estimado_usd || 0), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPAS.map((etapa) => {
          const Icon = etapa.icon;
          const oportunidadesEtapa = getOportunidadesPorEtapa(etapa.id);
          const valorTotal = calcularValorEtapa(etapa.id);
          
          return (
            <div
              key={etapa.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, etapa.id)}
              onDragLeave={(e) => handleDragLeave(e, etapa.id)}
              onDrop={(e) => handleDrop(e, etapa.id)}
            >
              {/* Header de columna */}
              <div className={`
                ${etapa.color} border-2 rounded-t-lg p-4 transition-all
                ${dragOverColumn === etapa.id ? 'ring-4 ring-green-400 ring-opacity-50' : ''}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">{etapa.nombre}</h3>
                  </div>
                  <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {oportunidadesEtapa.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{etapa.descripcion}</p>
                <p className="text-sm font-semibold text-gray-800">
                  ${valorTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </div>

              {/* Contenedor de tarjetas */}
              <div className="bg-gray-50 border-2 border-t-0 border-gray-200 rounded-b-lg p-3 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3">
                {oportunidadesEtapa.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Sin oportunidades
                  </div>
                ) : (
                  oportunidadesEtapa.map((oportunidad) => (
                    <OportunidadCard
                      key={oportunidad.id}
                      oportunidad={oportunidad}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onActualizar={onActualizar}
                      isDragging={draggedItem?.id === oportunidad.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineKanban;
