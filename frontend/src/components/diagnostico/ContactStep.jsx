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

  const paisesConCodigo = [
    { pais: 'Argentina', codigo: '+54' },
    { pais: 'Belice', codigo: '+501' },
    { pais: 'Bolivia', codigo: '+591' },
    { pais: 'Brasil', codigo: '+55' },
    { pais: 'Chile', codigo: '+56' },
    { pais: 'Colombia', codigo: '+57' },
    { pais: 'Costa Rica', codigo: '+506' },
    { pais: 'Cuba', codigo: '+53' },
    { pais: 'Ecuador', codigo: '+593' },
    { pais: 'El Salvador', codigo: '+503' },
    { pais: 'Guatemala', codigo: '+502' },
    { pais: 'Guyana', codigo: '+592' },
    { pais: 'Haití', codigo: '+509' },
    { pais: 'Honduras', codigo: '+504' },
    { pais: 'Jamaica', codigo: '+876' },
    { pais: 'México', codigo: '+52' },
    { pais: 'Nicaragua', codigo: '+505' },
    { pais: 'Panamá', codigo: '+507' },
    { pais: 'Paraguay', codigo: '+595' },
    { pais: 'Perú', codigo: '+51' },
    { pais: 'Puerto Rico', codigo: '+1' },
    { pais: 'República Dominicana', codigo: '+1' },
    { pais: 'Surinam', codigo: '+597' },
    { pais: 'Trinidad y Tobago', codigo: '+868' },
    { pais: 'Uruguay', codigo: '+598' },
    { pais: 'Venezuela', codigo: '+58' },
    { pais: 'Otro', codigo: '+' }
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

  const paisTelefono = watch('pais_telefono');
  const codigoArea = paisesConCodigo.find(p => p.pais === paisTelefono)?.codigo || '+';

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
        {/* Nombre y Apellidos en dos campos */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              data-testid="nombre-input"
              {...register('nombre')}
              placeholder="Ej: María"
              className="mt-1"
              maxLength={25}
              onInput={(e) => {
                // Solo permitir letras, espacios y acentos
                e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, '');
              }}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="apellidos">
              Apellidos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apellidos"
              data-testid="apellidos-input"
              {...register('apellidos')}
              placeholder="Ej: González Rodríguez"
              className="mt-1"
              maxLength={35}
              onInput={(e) => {
                // Solo permitir letras, espacios y acentos
                e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, '');
              }}
            />
            {errors.apellidos && (
              <p className="text-red-500 text-sm mt-1">
                {errors.apellidos.message}
              </p>
            )}
          </div>
        </div>

        {/* Email corporativo */}
        <div>
          <Label htmlFor="email">
            Email corporativo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            data-testid="email-input"
            {...register('email')}
            placeholder="tu.email@empresa.com"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Solo dominios corporativos (no se aceptan gmail, yahoo, hotmail, outlook)
          </p>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono con selector de país */}
        <div>
          <Label htmlFor="telefono">
            Teléfono <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2 mt-1">
            <Select
              onValueChange={(value) => setValue('pais_telefono', value, { shouldValidate: true })}
              value={watch('pais_telefono')}
            >
              <SelectTrigger className="w-[200px]" data-testid="pais-telefono-select">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                {paisesConCodigo.map((item) => (
                  <SelectItem key={item.pais} value={item.pais}>
                    {item.pais} ({item.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              id="telefono"
              data-testid="telefono-input"
              {...register('telefono')}
              placeholder="8888-9999"
              className="flex-1"
              maxLength={9}
              onInput={(e) => {
                // Solo permitir números y guión en formato ####-####
                let value = e.target.value.replace(/[^\d-]/g, '');
                if (value.length === 4 && !value.includes('-')) {
                  value = value + '-';
                } else if (value.length > 9) {
                  value = value.substring(0, 9);
                }
                e.target.value = value;
                setValue('telefono', value, { shouldValidate: true });
              }}
            />
          </div>
          {errors.pais_telefono && (
            <p className="text-red-500 text-sm mt-1">{errors.pais_telefono.message}</p>
          )}
          {errors.telefono && (
            <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
          )}
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
              {paisesConCodigo.map((item) => (
                <SelectItem key={item.pais} value={item.pais}>
                  {item.pais}
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