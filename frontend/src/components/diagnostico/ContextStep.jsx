import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

const ContextStep = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedSector = watch('sector');

  const sectores = [
    'Servicios financieros',
    'Manufactura y producción industrial',
    'Energía y servicios públicos',
    'Comercio y retail',
    'Tecnología y telecomunicaciones',
    'Construcción e inmobiliario',
    'Agroindustria y alimentos',
    'Turismo y hospitalidad',
    'Transporte y logística',
    'otro',
  ];

  const tamanos = [
    '50-200 empleados | Ingresos <$10M anuales',
    '200-500 empleados | Ingresos $10M-$50M anuales',
    '500-1000 empleados | Ingresos $50M-$200M anuales',
    'Más de 1000 empleados | Ingresos >$200M anuales',
  ];

  const motivaciones = [
    'Requerimiento regulatorio actual o próximo',
    'Presión de inversionistas, accionistas o casa matriz',
    'Acceso a financiamiento sostenible o verde',
    'Ventaja competitiva y reputación corporativa',
    'Cadena de suministro lo está solicitando',
    'Convicción propia de la dirección',
    'Aún estamos explorando',
  ];

  const plazos = [
    'Ya deberíamos haberlo publicado (estamos retrasados)',
    'Próximos 3-6 meses',
    '6-12 meses',
    'Más de 12 meses',
    'Aún no tenemos plazo definido',
  ];

  return (
    <div data-testid="context-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Contexto y urgencia
        </h2>
        <p className="text-gray-600">
          Entender tu situación actual y necesidades
        </p>
      </div>

      {/* P1: Sector */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          1. ¿En qué sector opera tu organización?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('sector')}
          onValueChange={(value) => setValue('sector', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {sectores.map((sector, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={sector === 'otro' ? 'otro' : sector}
                id={`sector-${index}`}
                data-testid={`sector-option-${index}`}
              />
              <Label htmlFor={`sector-${index}`} className="font-normal cursor-pointer">
                {sector === 'otro' ? 'Otro' : sector}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {selectedSector === 'otro' && (
          <Input
            {...register('sector_otro')}
            placeholder="Especifica tu sector"
            className="mt-2"
            data-testid="sector-otro-input"
          />
        )}
        {errors.sector && (
          <p className="text-red-500 text-sm mt-1">{errors.sector.message}</p>
        )}
      </div>

      {/* P2: Tamaño */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          2. ¿Cuál es el tamaño de tu organización?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('tamano')}
          onValueChange={(value) => setValue('tamano', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {tamanos.map((tamano, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={tamano}
                id={`tamano-${index}`}
                data-testid={`tamano-option-${index}`}
              />
              <Label htmlFor={`tamano-${index}`} className="font-normal cursor-pointer">
                {tamano}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.tamano && (
          <p className="text-red-500 text-sm mt-1">{errors.tamano.message}</p>
        )}
      </div>

      {/* P3: Motivación */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          3. ¿Cuál es tu principal motivación para implementar NIIF S1/S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('motivacion')}
          onValueChange={(value) => setValue('motivacion', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {motivaciones.map((motivacion, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={motivacion}
                id={`motivacion-${index}`}
                data-testid={`motivacion-option-${index}`}
              />
              <Label htmlFor={`motivacion-${index}`} className="font-normal cursor-pointer">
                {motivacion}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.motivacion && (
          <p className="text-red-500 text-sm mt-1">{errors.motivacion.message}</p>
        )}
      </div>

      {/* P4: Plazo */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          4. ¿Cuál es tu plazo para el primer informe bajo NIIF S1/S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('plazo')}
          onValueChange={(value) => setValue('plazo', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {plazos.map((plazo, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={plazo}
                id={`plazo-${index}`}
                data-testid={`plazo-option-${index}`}
              />
              <Label htmlFor={`plazo-${index}`} className="font-normal cursor-pointer">
                {plazo}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.plazo && (
          <p className="text-red-500 text-sm mt-1">{errors.plazo.message}</p>
        )}
      </div>
    </div>
  );
};

export default ContextStep;