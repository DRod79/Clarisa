import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ContactStep = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div data-testid="contact-step" className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Cuéntanos sobre ti
        </h2>
        <p className="text-gray-600">Información de contacto básica</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre_completo">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre_completo"
            data-testid="nombre-completo-input"
            {...register('nombre_completo')}
            placeholder="María González Rodríguez"
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
            placeholder="maria.gonzalez@empresa.com"
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
        </div>

        <div>
          <Label htmlFor="organizacion">
            Nombre de la organización <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organizacion"
            data-testid="organizacion-input"
            {...register('organizacion')}
            placeholder="Banco Comercial de Costa Rica"
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
            placeholder="Directora Financiera"
            className="mt-1"
          />
          {errors.puesto && (
            <p className="text-red-500 text-sm mt-1">{errors.puesto.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactStep;