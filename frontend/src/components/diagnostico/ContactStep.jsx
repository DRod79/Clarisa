import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ContactStep = ({ form }) => {
  const { register, formState: { errors }, setValue, watch } = form;

  const paises = [
    'Argentina', 'Belice', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
    'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
    'Guyana', 'Haití', 'Honduras', 'Jamaica', 'México', 'Nicaragua',
    'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
    'Surinam', 'Trinidad y Tobago', 'Uruguay', 'Venezuela', 'Otro'
  ];

  const departamentos = [
    'Auditoría',
    'Compras',
    'Dirección General',
    'Finanzas/Contabilidad',
    'Investigación y Desarrollo (I+D)',
    'Logística',
    'Marketing',
    'Producción/Operaciones',
    'Recursos Humanos',
    'Sostenibilidad',
    'Tecnología de la Información (TI)',
    'Ventas',
    'Otro'
  ];

  const anosExperiencia = [
    'Menos de 1 año',
    'De 1 a 2 años',
    'De 2 a 5 años',
    'De 5 a 7 años',
    'Más de 7 años'
  ];

  return (
    <div data-testid="contact-step" className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Cuéntanos sobre ti
        </h2>
        <p className="text-gray-600">Información de contacto básica</p>
      </div>

      {/* Sección A: Información de Contacto */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre_completo">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre_completo"
            data-testid="nombre-completo-input"
            {...register('nombre_completo')}
            placeholder="Ej: María González Rodríguez"
            className="mt-1"
          />
          {errors.nombre_completo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.nombre_completo.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            data-testid="email-input"
            {...register('email')}
            placeholder="tu.email@empresa.com"
            className="mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono (opcional)</Label>
          <Input
            id="telefono"
            data-testid="telefono-input"
            {...register('telefono')}
            placeholder="+506 8888-9999"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">Opcional - formato internacional</p>
        </div>

        <div>
          <Label htmlFor="organizacion">
            Nombre de la organización <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organizacion"
            data-testid="organizacion-input"
            {...register('organizacion')}
            placeholder="Ej: Banco Comercial de Costa Rica"
            className="mt-1"
          />
          {errors.organizacion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.organizacion.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="puesto">
            Puesto o rol <span className="text-red-500">*</span>
          </Label>
          <Input
            id="puesto"
            data-testid="puesto-input"
            {...register('puesto')}
            placeholder="Ej: Directora Financiera"
            className="mt-1"
          />
          {errors.puesto && (
            <p className="text-red-500 text-sm mt-1">{errors.puesto.message}</p>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-6" />

      {/* Sección B: Información de Perfil */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="pais">
            Selecciona tu país <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) => setValue('pais', value, { shouldValidate: true })}
            value={watch('pais')}
          >
            <SelectTrigger className="mt-1" data-testid="pais-select">
              <SelectValue placeholder="Selecciona tu país" />
            </SelectTrigger>
            <SelectContent>
              {paises.map((pais) => (
                <SelectItem key={pais} value={pais}>
                  {pais}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.pais && (
            <p className="text-red-500 text-sm mt-1">{errors.pais.message}</p>
          )}
        </div>

        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            ¿En qué departamento o área trabajas?
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watch('departamento')}
            onValueChange={(value) => setValue('departamento', value, { shouldValidate: true })}
            className="space-y-2"
          >
            {departamentos.map((depto, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={depto}
                  id={`depto-${index}`}
                  data-testid={`departamento-option-${index}`}
                />
                <Label htmlFor={`depto-${index}`} className="font-normal cursor-pointer">
                  {depto}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.departamento && (
            <p className="text-red-500 text-sm mt-1">{errors.departamento.message}</p>
          )}
        </div>

        <div>
          <Label className="text-base font-semibold text-gray-900 mb-3 block">
            ¿Con cuántos años de experiencia profesional cuentas?
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={watch('anios_experiencia')}
            onValueChange={(value) => setValue('anios_experiencia', value, { shouldValidate: true })}
            className="space-y-2"
          >
            {anosExperiencia.map((anos, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={anos}
                  id={`anos-${index}`}
                  data-testid={`experiencia-option-${index}`}
                />
                <Label htmlFor={`anos-${index}`} className="font-normal cursor-pointer">
                  {anos}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.anios_experiencia && (
            <p className="text-red-500 text-sm mt-1">{errors.anios_experiencia.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactStep;