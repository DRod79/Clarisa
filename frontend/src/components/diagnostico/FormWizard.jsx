import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import ContactStep from './ContactStep';
import ContextStep from './ContextStep';
import MaturityStep from './MaturityStep';
import GovernanceStep from './GovernanceStep';
import DataStep from './DataStep';
import NeedsStep from './NeedsStep';
import ConfirmationPage from './ConfirmationPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TOTAL_STEPS = 6;

// Validation schema
const formSchema = z.object({
  // Contacto
  nombre_completo: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  organizacion: z.string().min(2, 'Organización requerida'),
  puesto: z.string().min(2, 'Puesto requerido'),
  // Contexto
  sector: z.string().min(1, 'Selecciona un sector'),
  sector_otro: z.string().optional(),
  tamano: z.string().min(1, 'Selecciona el tamaño'),
  motivacion: z.string().min(1, 'Selecciona una motivación'),
  plazo: z.string().min(1, 'Selecciona un plazo'),
  // Madurez
  p5_divulgacion_actual: z.string().min(1, 'Respuesta requerida'),
  p6_nivel_datos: z.string().min(1, 'Respuesta requerida'),
  p7_metodologia_carbono: z.string().min(1, 'Respuesta requerida'),
  p8_materialidad: z.string().min(1, 'Respuesta requerida'),
  p9_equipo_dedicado: z.string().min(1, 'Respuesta requerida'),
  // Gobernanza
  p10_sponsor_ejecutivo: z.string().min(1, 'Respuesta requerida'),
  p11_apetito_inversion: z.string().min(1, 'Respuesta requerida'),
  p12_experiencia_reporteo: z.string().min(1, 'Respuesta requerida'),
  p13_asesor_externo: z.string().min(1, 'Respuesta requerida'),
  // Datos
  p14_sistemas_datos: z.string().min(1, 'Respuesta requerida'),
  p15_calidad_datos: z.string().min(1, 'Respuesta requerida'),
  p16_cadena_valor: z.string().min(1, 'Respuesta requerida'),
  p17_capacidad_tecnica: z.string().min(1, 'Respuesta requerida'),
  // Necesidades
  p18_mayor_obstaculo: z.string().min(1, 'Respuesta requerida'),
  p19_apoyo_valioso: z.array(z.string()).min(1, 'Selecciona al menos una opción').max(2, 'Máximo 2 opciones'),
  p20_inversion_dispuesta: z.string().min(1, 'Respuesta requerida'),
});

const FormWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      nombre_completo: '',
      email: '',
      telefono: '',
      organizacion: '',
      puesto: '',
      sector: '',
      sector_otro: '',
      tamano: '',
      motivacion: '',
      plazo: '',
      p5_divulgacion_actual: '',
      p6_nivel_datos: '',
      p7_metodologia_carbono: '',
      p8_materialidad: '',
      p9_equipo_dedicado: '',
      p10_sponsor_ejecutivo: '',
      p11_apetito_inversion: '',
      p12_experiencia_reporteo: '',
      p13_asesor_externo: '',
      p14_sistemas_datos: '',
      p15_calidad_datos: '',
      p16_cadena_valor: '',
      p17_capacidad_tecnica: '',
      p18_mayor_obstaculo: '',
      p19_apoyo_valioso: [],
      p20_inversion_dispuesta: '',
    },
  });

  const { handleSubmit, watch, trigger } = form;

  // Save to localStorage on change
  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem('clarisa_diagnostico_draft', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('clarisa_diagnostico_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach((key) => {
          form.setValue(key, data[key]);
        });
      } catch (e) {
        console.error('Error loading saved data', e);
      }
    }
  }, [form]);

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ['nombre_completo', 'email', 'telefono', 'organizacion', 'puesto'];
      case 2:
        return ['sector', 'tamano', 'motivacion', 'plazo'];
      case 3:
        return ['p5_divulgacion_actual', 'p6_nivel_datos', 'p7_metodologia_carbono', 'p8_materialidad', 'p9_equipo_dedicado'];
      case 4:
        return ['p10_sponsor_ejecutivo', 'p11_apetito_inversion', 'p12_experiencia_reporteo', 'p13_asesor_externo'];
      case 5:
        return ['p14_sistemas_datos', 'p15_calidad_datos', 'p16_cadena_valor', 'p17_capacidad_tecnica'];
      case 6:
        return ['p18_mayor_obstaculo', 'p19_apoyo_valioso', 'p20_inversion_dispuesta'];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // If sector is 'otro', use sector_otro value
      const submitData = {
        ...data,
        sector: data.sector === 'otro' ? data.sector_otro : data.sector,
      };
      delete submitData.sector_otro;

      const response = await axios.post(`${API}/diagnostico`, submitData);

      if (response.data) {
        // Clear localStorage
        localStorage.removeItem('clarisa_diagnostico_draft');
        setIsSubmitted(true);
        toast.success('¡Diagnóstico enviado exitosamente!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el diagnóstico. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <ConfirmationPage email={form.getValues('email')} nombre={form.getValues('nombre_completo')} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ContactStep form={form} />;
      case 2:
        return <ContextStep form={form} />;
      case 3:
        return <MaturityStep form={form} />;
      case 4:
        return <GovernanceStep form={form} />;
      case 5:
        return <DataStep form={form} />;
      case 6:
        return <NeedsStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8" data-testid="form-wizard">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                data-testid="prev-button"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                data-testid="next-button"
                className="bg-[#4CAF50] hover:bg-[#45a049] flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                data-testid="submit-button"
                disabled={isSubmitting}
                className="bg-[#4CAF50] hover:bg-[#45a049]"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Diagnóstico'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormWizard;