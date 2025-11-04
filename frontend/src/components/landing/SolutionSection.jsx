import React from 'react';
import { Gauge, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

const SolutionSection = () => {
  const solutions = [
    {
      icon: Gauge,
      title: 'VELOCIDAD INTELIGENTE',
      subtitle: 'De 18 meses a 6 meses',
      description:
        'No es apuro, es eficiencia radical. Eliminamos todo lo innecesario y estructuramos lo complejo para que avances rápido sin sacrificar calidad.',
    },
    {
      icon: Users,
      title: 'APRENDE IMPLEMENTANDO',
      subtitle: 'Conocimiento + Acción',
      description:
        'No cursos teóricos separados de la realidad. Tu equipo aprende aplicando cada concepto directamente en tu organización mientras avanza.',
    },
    {
      icon: TrendingUp,
      title: 'INVERSIÓN ESCALABLE',
      subtitle: 'Desde $1K hasta $10K/año',
      description:
        'Empieza con lo esencial y agrega servicios según necesites. Sin comprometer presupuesto completo desde el inicio.',
    },
  ];

  return (
    <section
      data-testid="solution-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2
            data-testid="solution-title"
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            La alternativa moderna a consultoras tradicionales
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Clarisa combina herramientas digitales, contenido experto y comunidad
            de práctica para que implementes con tu equipo. Sin dependencias
            eternas. Sin costos prohibitivos. Con resultados en 6 meses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card
                key={index}
                data-testid={`solution-card-${index}`}
                className="p-8 bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {solution.title}
                  </h3>
                  <p className="text-lg font-semibold text-[#2D5F3F]">
                    {solution.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {solution.description}
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

export default SolutionSection;