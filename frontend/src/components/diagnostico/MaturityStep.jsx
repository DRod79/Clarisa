import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const MaturityStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const questions = [
    {
      id: 'p5_divulgacion_actual',
      question: '5. ¿Qué tipo de divulgación de sostenibilidad publicas actualmente?',
      options: [
        'Ningún reporte de sostenibilidad',
        'Sección breve en memoria anual',
        'Reporte de sostenibilidad separado (no alineado a estándares)',
        'Reporte alineado a GRI, SASB u otro marco',
        'Reporte integrado o alineado a TCFD',
      ],
    },
    {
      id: 'p6_nivel_datos',
      question: '6. ¿Qué nivel de datos ESG recolectas hoy?',
      options: [
        'No recolectamos datos ESG estructurados',
        'Solo datos básicos (consumo energía, empleados)',
        'Algunos indicadores clave por área',
        'Conjunto amplio pero disperso en distintos sistemas',
        'Datos ESG consolidados en sistema centralizado',
      ],
    },
    {
      id: 'p7_metodologia_carbono',
      question: '7. ¿Calculan su huella de carbono (GEI)?',
      options: [
        'No, nunca lo hemos hecho',
        'Estimación informal o parcial',
        'Cálculo anual básico (Alcance 1 y 2)',
        'Cálculo detallado (Alcance 1, 2 y parte del 3)',
        'Cálculo completo con verificación externa',
      ],
    },
    {
      id: 'p8_materialidad',
      question: '8. ¿Han realizado un análisis de materialidad (temas relevantes)?',
      options: [
        'No, no sabemos qué es',
        'Sabemos qué es pero no lo hemos hecho',
        'Análisis informal interno',
        'Análisis estructurado hace más de 2 años',
        'Análisis reciente con stakeholders (<2 años)',
      ],
    },
    {
      id: 'p9_equipo_dedicado',
      question: '9. ¿Tienen equipo o persona dedicada a sostenibilidad?',
      options: [
        'No hay nadie asignado',
        'Alguien lo hace part-time sin experiencia formal',
        '1 persona dedicada con conocimiento básico',
        'Equipo pequeño (2-3 personas) con experiencia',
        'Equipo consolidado con líder senior',
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