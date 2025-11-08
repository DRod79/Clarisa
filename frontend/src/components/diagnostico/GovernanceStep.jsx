import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const GovernanceStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p10_liderazgo',
      question: '10. ¿Quién lidera la estrategia de sostenibilidad en tu organización?',
      options: [
        'Dirección General o Gerencia General directamente',
        'Área específica de Sostenibilidad o Responsabilidad Social',
        'Área de Riesgos, Cumplimiento o Legal',
        'Área Financiera o Contable',
        'Múltiples áreas sin claridad de responsabilidad',
        'Nadie formalmente asignado',
      ],
    },
    {
      id: 'p11_junta',
      question: '11. ¿La Junta Directiva o Consejo de Administración supervisa temas de sostenibilidad?',
      options: [
        'Sí, hay comité específico y reportes regulares',
        'Sí, se reporta ocasionalmente en sesiones',
        'No, pero están solicitando información',
        'No, no es prioridad aún para el nivel directivo',
      ],
    },
    {
      id: 'p12_personas_dedicadas',
      question: '12. ¿Cuántas personas están dedicadas a sostenibilidad actualmente en tu organización?',
      options: [
        '3 o más personas con dedicación completa',
        '1-2 personas con dedicación completa',
        'Tiempo parcial de varias personas (menos del 50% de su tiempo)',
        'Nadie dedicado (0 personas asignadas)',
      ],
    },
    {
      id: 'p13_presupuesto',
      question: '13. ¿Tienen presupuesto asignado para la implementación de reporteo de sostenibilidad?',
      options: [
        'Sí, presupuesto aprobado mayor a $50,000',
        'Sí, presupuesto aprobado menor a $50,000',
        'En proceso de aprobación o negociación',
        'No, aún no hemos presupuestado nada',
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