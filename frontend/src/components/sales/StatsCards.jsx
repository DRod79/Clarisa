import React from 'react';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Oportunidades',
      value: stats.total_oportunidades || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Valor Total Pipeline',
      value: `$${(stats.valor_total_pipeline_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Valor Ponderado',
      value: `$${(stats.valor_ponderado_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtitle: 'Basado en probabilidad'
    },
    {
      title: 'Prioridad Alta (A)',
      value: (
        (stats.por_prioridad?.A1 || 0) + 
        (stats.por_prioridad?.A2 || 0) + 
        (stats.por_prioridad?.A3 || 0)
      ),
      icon: Target,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
