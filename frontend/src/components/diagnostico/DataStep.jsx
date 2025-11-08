import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const DataStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p14_recopilacion',
      question: '14. ¿Cómo recopilan actualmente datos ambientales, sociales y de gobernanza?',
      options: [
        'Sistema integrado de gestión o plataforma especializada',
        'Hojas de cálculo centralizadas con proceso definido',
        'Hojas de cálculo descentralizadas sin proceso estándar',
        'No recopilamos de manera sistemática',
        'No lo sé',
      ],
    },
    {
      id: 'p15_control_interno',
      question: '15. ¿Tienen procesos de control interno para datos no-financieros?',
      options: [
        'Sí, con controles y revisiones establecidas similares a datos financieros',
        'Parcialmente, estamos desarrollándolos',
        'No, solo tenemos controles para datos financieros',
        'No lo sé o no estoy seguro',
      ],
    },
    {
      id: 'p16_datos_auditables',
      question: '16. ¿Sus datos están listos para ser auditados o verificados externamente?',
      options: [
        'Sí, ya tenemos verificación externa de nuestros datos',
        'Casi, necesitamos mejoras menores en documentación',
        'No, necesitamos trabajo significativo en calidad y trazabilidad de datos',
        'No lo sé o no hemos evaluado esto',
      ],
    },
    {
      id: 'p17_rastreo_impacto',
      question: '17. ¿Qué tan fácil es rastrear el impacto ambiental y social de sus operaciones y cadena de valor?',
      options: [
        'Tenemos sistemas que lo permiten con relativa facilidad',
        'Es posible pero requiere trabajo manual significativo',
        'Muy difícil, no tenemos esa granularidad de información',
        'No lo hemos intentado o no sabemos cómo hacerlo',
      ],
    },
  ];

  return (
    <div data-testid="data-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Infraestructura de datos
        </h2>
        <p className="text-gray-600">
          Capacidad técnica y calidad de datos
        </p>
      </div>

      {questions.map((q) => (
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

export default DataStep;