import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

const ContextStep = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedSector = watch('p1_sector');

  const sectores = [
    'Servicios financieros (bancos, aseguradoras, cooperativas)',
    'Manufactura y producción industrial',
    'Energía y servicios públicos',
    'Comercio y retail',
    'Tecnología y telecomunicaciones',
    'Construcción e inmobiliario',
    'Agroindustria y alimentos',
    'Turismo y hospitalidad',
    'Transporte y logística',
    'Otro'
  ];

  const tamanos = [
    '50-200 empleados | Ingresos anuales <$10M USD',
    '200-500 empleados | Ingresos $10M-$50M USD',
    '500-1000 empleados | Ingresos $50M-$200M USD',
    'Más de 1000 empleados | Ingresos >$200M USD'
  ];

  const motivaciones = [
    'Requerimiento regulatorio actual o próximo',
    'Presión de inversionistas, accionistas o casa matriz',
    'Acceso a financiamiento sostenible o verde',
    'Ventaja competitiva y reputación corporativa',
    'Cadena de suministro lo está solicitando',
    'Convicción propia de la dirección',
    'Aún estamos explorando'
  ];

  const plazos = [
    'Ya deberíamos haberlo publicado (estamos retrasados)',
    'Próximos 3-6 meses',
    '6-12 meses',
    'Más de 12 meses',
    'Aún no tenemos plazo definido'
  ];

  return (
    <div data-testid="context-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Contexto y urgencia
        </h2>
        <p className="text-gray-600">
          Ayúdanos a entender tu situación actual
        </p>
      </div>

      {/* P1: Sector */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          1. ¿En qué sector opera tu organización?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p1_sector')}
          onValueChange={(value) => setValue('p1_sector', value, { shouldValidate: true })}
          className="space-y-2"
        >
          {sectores.map((sector, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={sector}
                id={`sector-${index}`}
                data-testid={`sector-option-${index}`}
              />
              <Label htmlFor={`sector-${index}`} className="font-normal cursor-pointer">
                {sector}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {selectedSector === 'Otro' && (
          <Input
            {...register('sector_otro')}
            placeholder="Especifica tu sector"
            className="mt-2"
            data-testid="sector-otro-input"
          />
        )}
        {errors.p1_sector && (
          <p className="text-red-500 text-sm mt-1">{errors.p1_sector.message}</p>
        )}
      </div>

      {/* P2: Tamaño */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          2. ¿Cuál es el tamaño de tu organización?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p2_tamano')}
          onValueChange={(value) => setValue('p2_tamano', value, { shouldValidate: true })}
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
        {errors.p2_tamano && (
          <p className="text-red-500 text-sm mt-1">{errors.p2_tamano.message}</p>
        )}
      </div>

      {/* P3: Motivación */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          3. ¿Cuál es tu principal motivación para implementar NIIF S1 y S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p3_motivacion')}
          onValueChange={(value) => setValue('p3_motivacion', value, { shouldValidate: true })}
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
        {errors.p3_motivacion && (
          <p className="text-red-500 text-sm mt-1">{errors.p3_motivacion.message}</p>
        )}
      </div>

      {/* P4: Plazo */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          4. ¿Cuál es tu plazo para el primer informe bajo NIIF S1/S2?
          <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={watch('p4_plazo')}
          onValueChange={(value) => setValue('p4_plazo', value, { shouldValidate: true })}
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
        {errors.p4_plazo && (
          <p className="text-red-500 text-sm mt-1">{errors.p4_plazo.message}</p>
        )}
      </div>
    </div>
  );
};

export default ContextStep;