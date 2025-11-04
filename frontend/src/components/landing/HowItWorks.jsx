import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '1',
      title: 'DIAGNOSTICA',
      description: 'Respondes 20 preguntas estratégicas (15 minutos)',
      benefits: [
        'Análisis de tu nivel de preparación',
        'Tus 5 brechas más críticas',
        'Hoja de ruta personalizada',
        'Comparación con sector',
      ],
      investment: 'Gratuito',
    },
    {
      number: '2',
      title: 'ESTRUCTURA',
      description: 'Accedes a la plataforma con:',
      benefits: [
        'Plantillas probadas de tu sector',
        'Videos de implementación paso a paso',
        'Calculadoras y herramientas',
        'Guías de casos reales',
      ],
      investment: 'Desde $99/mes',
    },
    {
      number: '3',
      title: 'IMPLEMENTA',
      description: 'Tu equipo avanza con:',
      benefits: [
        'Tareas priorizadas semana a semana',
        'Comunidad de practicantes',
        'Sesiones grupales mensuales de Q&A',
        'Recursos actualizados continuamente',
      ],
      investment: 'Incluido en membresía',
    },
    {
      number: '4',
      title: 'VALIDA',
      description: 'En momentos críticos obtienes:',
      benefits: [
        'Revisión experta de materialidad',
        'Validación de enfoque',
        'Verificación pre-publicación',
        'Acompañamiento estratégico',
      ],
      investment: 'Desde $5K (opcional)',
    },
  ];

  return (
    <section
      id="como-funciona"
      data-testid="how-it-works-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2
            data-testid="how-it-works-title"
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Cómo funciona Clarisa
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cuatro pasos para pasar de confusión a implementación
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              data-testid={`step-card-${index}`}
              className="p-6 bg-white hover:shadow-xl transition-all relative"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4CAF50] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {step.number}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <h3 className="text-xl font-bold text-[#2D5F3F]">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>

                <ul className="space-y-2">
                  {step.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-[#4CAF50] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-[#2D5F3F]">
                    {step.investment}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            data-testid="how-it-works-cta"
            onClick={() => navigate('/diagnostico')}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-lg font-semibold px-10 py-6 rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            EMPIEZA CON TU DIAGNÓSTICO GRATUITO
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;