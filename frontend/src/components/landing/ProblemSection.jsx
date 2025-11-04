import React from 'react';
import { Clock, DollarSign, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ProblemSection = () => {
  const problems = [
    {
      icon: Clock,
      title: 'PRESIÓN DE TIEMPO',
      description:
        'Tenemos 12 meses para implementar S1/S2 pero las consultoras dicen que toma 18-24 meses',
    },
    {
      icon: DollarSign,
      title: 'PRESUPUESTO LIMITADO',
      description:
        'Las Big 4 piden $150K pero nosotros solo tenemos $30-50K asignados',
    },
    {
      icon: BookOpen,
      title: 'COMPLEJIDAD TÉCNICA',
      description:
        'He leído las normas pero no sé por dónde empezar ni cómo aplicarlas a mi realidad',
    },
  ];

  return (
    <section
      data-testid="problem-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          data-testid="problem-title"
          className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          ¿Te suena familiar?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <Card
                key={index}
                data-testid={`problem-card-${index}`}
                className="p-8 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;