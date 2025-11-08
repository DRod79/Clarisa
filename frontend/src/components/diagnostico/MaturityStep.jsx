import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const MaturityStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p5_publica_info',
      question: '5. ¿Tu organización actualmente publica información de sostenibilidad?',
      options: [
        'Sí, tenemos informe integrado o de sostenibilidad publicado anualmente',
        'Sí, pero solo internamente o para grupos de interés específicos',
        'Reportamos parcialmente (solo temas ambientales o sociales)',
        'No, este será nuestro primer informe',
        'No lo sé',
      ],
    },
    {
      id: 'p6_materialidad',
      question: '6. ¿Han realizado un análisis de doble materialidad (impacto & financiera)?',
      options: [
        'Sí, tenemos materialidad definida, documentada y aprobada',
        'Lo hicimos hace más de 2 años (necesita actualización)',
        'Estamos en proceso de realizarlo',
        'No, no sabemos cómo hacerlo',
        '¿Qué es el análisis de materialidad?',
      ],
    },
    {
      id: 'p7_familiaridad',
      question: '7. ¿Qué tan familiarizado está tu equipo con las normas NIIF S1 y S2?',
      options: [
        'Alto: Hemos tomado cursos y entendemos los requisitos',
        'Medio: Hemos leído las normas pero tenemos dudas',
        'Bajo: Solo conocemos lo básico por artículos o menciones',
        'Nulo: Estamos empezando desde cero',
      ],
    },
    {
      id: 'p8_riesgos_clima',
      question: '8. ¿Tienen identificados los riesgos y oportunidades relacionados con el clima para su negocio?',
      options: [
        'Sí, tenemos registro detallado y cuantificado',
        'Parcialmente, pero no están cuantificados ni priorizados',
        'No, aún no los hemos identificado de manera sistemática',
        'No aplica a nuestro sector',
      ],
    },
    {
      id: 'p9_huella_carbono',
      question: '9. ¿Tu organización mide actualmente su huella de carbono (Alcance 1, 2, 3)?',
      options: [
        'Sí, los 3 alcances con verificación externa',
        'Sí, pero solo Alcance 1 y 2',
        'Hemos medido alguna vez pero no de forma continua',
        'No, pero sabemos cómo calcularlo',
        'No, necesitamos ayuda para empezar',
      ],
    },
  ];

  return (
    <div data-testid="maturity-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Madurez en sostenibilidad
        </h2>
        <p className="text-gray-600">
          Evalúa tu nivel actual de preparación
        </p>
      </div>

      {questions.map((q, index) => (
        <div key={q.id}>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            {q.question}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watch(q.id)}
            onValueChange={(value) => setValue(q.id, value, { shouldValidate: true })}
            className="space-y-2"
          >
            {q.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${q.id}-${optIndex}`}
                  data-testid={`${q.id}-option-${optIndex}`}
                />
                <Label htmlFor={`${q.id}-${optIndex}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors[q.id] && (
            <p className="text-red-500 text-sm mt-1">{errors[q.id].message}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MaturityStep;