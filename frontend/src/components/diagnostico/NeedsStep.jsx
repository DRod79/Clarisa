import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const NeedsStep = ({ form }) => {
  const { formState: { errors }, watch, setValue } = form;

  const obstaculos = [
    'No sabemos por dónde empezar o cómo priorizar',
    'Falta de recursos humanos o presupuesto',
    'Complejidad técnica de las normas',
    'Falta de datos, sistemas o herramientas',
    'Falta de compromiso interno o prioridad de la dirección',
    'Falta de conocimiento técnico en el equipo',
  ];

  const apoyos = [
    'Diagnóstico de brechas y hoja de ruta clara',
    'Capacitación práctica del equipo interno',
    'Plantillas, formatos y herramientas listas para usar',
    'Consultoría uno a uno para casos específicos',
    'Comunidad de pares para compartir experiencias',
    'Plataforma digital que facilite el proceso completo',
  ];

  const inversiones = [
    '$5,000 - $15,000',
    '$15,000 - $30,000',
    '$30,000 - $50,000',
    'Más de $50,000',
    'Prefiero no responder o necesito más información',
  ];

  const selectedApoyos = watch('p19_apoyo_valioso') || [];

  const handleApoyoChange = (value, checked) => {
    let newValues;
    if (checked) {
      if (selectedApoyos.length >= 2) {
        return; // Don't allow more than 2
      }
      newValues = [...selectedApoyos, value];
    } else {
      newValues = selectedApoyos.filter((v) => v !== value);
    }
    setValue('p19_apoyo_valioso', newValues, { shouldValidate: true });
  };

  return (
    <div data-testid="needs-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Brechas y necesidades
        </h2>
        <p className="text-gray-600">
          Identifica tus principales desafíos
        </p>
      </div>

      {/* P18: Obstáculo */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          18. ¿Cuál es tu mayor obstáculo para implementar NIIF S1/S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p18_obstaculo')}
          onValueChange={(value) => setValue('p18_obstaculo', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {obstaculos.map((obstaculo, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={obstaculo}
                id={`obstaculo-${index}`}
                data-testid={`obstaculo-option-${index}`}
              />
              <Label htmlFor={`obstaculo-${index}`} className="font-normal cursor-pointer">
                {obstaculo}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.p18_mayor_obstaculo && (
          <p className="text-red-500 text-sm mt-1">{errors.p18_mayor_obstaculo.message}</p>
        )}
      </div>

      {/* P19: Apoyo valioso (checkboxes, max 2) */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          19. ¿Qué tipo de apoyo sería más valioso para ti? (Selecciona hasta 2)
          <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {apoyos.map((apoyo, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`apoyo-${index}`}
                data-testid={`apoyo-option-${index}`}
                checked={selectedApoyos.includes(apoyo)}
                onCheckedChange={(checked) => handleApoyoChange(apoyo, checked)}
                disabled={selectedApoyos.length >= 2 && !selectedApoyos.includes(apoyo)}
              />
              <Label htmlFor={`apoyo-${index}`} className="font-normal cursor-pointer">
                {apoyo}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Seleccionados: {selectedApoyos.length}/2
        </p>
        {errors.p19_apoyo_valioso && (
          <p className="text-red-500 text-sm mt-1">{errors.p19_apoyo_valioso.message}</p>
        )}
      </div>

      {/* P20: Inversión */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          20. ¿Cuánto estarías dispuesto a invertir en implementar NIIF S1/S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p20_inversion')}
          onValueChange={(value) => setValue('p20_inversion', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {inversiones.map((inversion, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={inversion}
                id={`inversion-${index}`}
                data-testid={`inversion-option-${index}`}
              />
              <Label htmlFor={`inversion-${index}`} className="font-normal cursor-pointer">
                {inversion}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.p20_inversion_dispuesta && (
          <p className="text-red-500 text-sm mt-1">{errors.p20_inversion_dispuesta.message}</p>
        )}
      </div>
    </div>
  );
};

export default NeedsStep;