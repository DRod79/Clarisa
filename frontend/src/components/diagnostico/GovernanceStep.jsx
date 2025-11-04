import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const GovernanceStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p10_sponsor_ejecutivo',
      question: '10. ¿Quién lidera o patrocina el proyecto NIIF S1/S2 en tu organización?',
      options: [
        'Aún no hay dueño claro',
        'Gerente o coordinador de área',
        'Director de área (Finanzas, Sostenibilidad, Riesgos)',
        'C-level (CFO, CSO, CEO)',
        'Junta Directiva involucrada directamente',
      ],
    },
    {
      id: 'p11_apetito_inversion',
      question: '11. ¿Cómo es el apetito de inversión de la dirección?',
      options: [
        'No hay claridad ni aprobación de presupuesto',
        'Aprobación muy limitada, reactiva',
        'Presupuesto moderado si se justifica bien',
        'Disposición clara a invertir lo necesario',
        'Alta prioridad estratégica con recursos asegurados',
      ],
    },
    {
      id: 'p12_experiencia_reporteo',
      question: '12. ¿Qué experiencia tiene tu organización en reporteo financiero complejo?',
      options: [
        'Básica, reportes sencillos',
        'Moderada, reportes estándar locales',
        'Sólida, reportes bajo estándares internacionales (IFRS)',
        'Avanzada, reportes integrados o múltiples jurisdicciones',
        'Experta, auditorías Big 4 y cumplimiento riguroso',
      ],
    },
    {
      id: 'p13_asesor_externo',
      question: '13. ¿Han trabajado antes con asesores externos en sostenibilidad?',
      options: [
        'Nunca hemos contratado asesores ESG',
        'Alguna consultoría puntual o workshop',
        'Asesoría específica (ej. huella de carbono)',
        'Relación continua con consultora o experto',
        'Múltiples proveedores, experiencia consolidada',
      ],
    },
  ];

  return (
    <div data-testid="governance-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Gobernanza y propiedad
        </h2>
        <p className="text-gray-600">
          Liderazgo y compromiso organizacional
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

export default GovernanceStep;