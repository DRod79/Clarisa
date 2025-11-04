import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const DataStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p14_sistemas_datos',
      question: '14. ¿Cómo están tus sistemas de información para capturar datos ESG?',
      options: [
        'No hay sistemas, todo manual y disperso',
        'Excel y archivos locales',
        'Algunos módulos en ERP o sistemas operativos',
        'Herramienta dedicada para sostenibilidad',
        'Plataforma integrada con dashboards en tiempo real',
      ],
    },
    {
      id: 'p15_calidad_datos',
      question: '15. ¿Cómo calificarías la calidad y trazabilidad de tus datos ESG?',
      options: [
        'Muy baja, datos incompletos o poco confiables',
        'Baja, muchos datos estimados o inconsistentes',
        'Media, datos razonables pero sin auditoría',
        'Buena, procesos definidos y documentados',
        'Excelente, datos auditables y verificados',
      ],
    },
    {
      id: 'p16_cadena_valor',
      question: '16. ¿Qué tanto conoces el impacto de tu cadena de valor (upstream/downstream)?',
      options: [
        'Muy poco, solo conocemos operaciones propias',
        'Algo, tenemos datos básicos de proveedores clave',
        'Moderado, monitoreamos algunos indicadores',
        'Bastante, evaluamos impactos principales',
        'Alto, tenemos mapeo completo y datos detallados',
      ],
    },
    {
      id: 'p17_capacidad_tecnica',
      question: '17. ¿Qué capacidad técnica tiene tu equipo en análisis de datos y reporteo?',
      options: [
        'Básica, dependen de soporte externo',
        'Intermedia, pueden hacer reportes sencillos',
        'Sólida, manejan herramientas y metodologías',
        'Avanzada, equipo con formación técnica',
        'Experta, analistas de datos dedicados',
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