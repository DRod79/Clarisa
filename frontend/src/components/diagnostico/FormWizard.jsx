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
import { calcularScoringCompleto } from '@/utils/scoring';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TOTAL_STEPS = 6;

// Validación de email corporativo (excluir dominios públicos)
const emailCorporativoRegex = /^[^\s@]+@(?!gmail\.|yahoo\.|hotmail\.|outlook\.|live\.|aol\.|icloud\.|protonmail\.|zoho\.|mail\.com|gmx\.|yandex\.|inbox\.|me\.com)[^\s@]+\.[^\s@]+$/i;

// Validation schema
const formSchema = z.object({
  // Contacto - campos actualizados
  nombre: z.string().min(2, 'Nombre requerido'),
  apellidos: z.string().min(2, 'Apellidos requeridos'),
  email: z.string()
    .email('Email inválido')
    .regex(emailCorporativoRegex, 'Usa tu email corporativo (no gmail, yahoo, hotmail, outlook)'),
  pais_telefono: z.string().min(1, 'Selecciona el país del teléfono'),
  telefono: z.string().min(4, 'Teléfono requerido'),
  organizacion: z.string().min(2, 'Organización requerida'),
  puesto: z.string().min(2, 'Puesto requerido'),
  pais: z.string().min(1, 'Selecciona tu país'),
  departamento: z.string().min(1, 'Selecciona tu departamento'),
  anios_experiencia: z.string().min(1, 'Selecciona años de experiencia'),
  
  // Contexto
  p1_sector: z.string().min(1, 'Selecciona un sector'),
  sector_otro: z.string().optional(),
  p2_tamano: z.string().min(1, 'Selecciona el tamaño'),
  p3_motivacion: z.string().min(1, 'Selecciona una motivación'),
  p4_plazo: z.string().min(1, 'Selecciona un plazo'),
  
  // Madurez
  p5_publica_info: z.string().min(1, 'Respuesta requerida'),
  p6_materialidad: z.string().min(1, 'Respuesta requerida'),
  p7_familiaridad: z.string().min(1, 'Respuesta requerida'),
  p8_riesgos_clima: z.string().min(1, 'Respuesta requerida'),
  p9_huella_carbono: z.string().min(1, 'Respuesta requerida'),
  
  // Gobernanza
  p10_liderazgo: z.string().min(1, 'Respuesta requerida'),
  p11_junta: z.string().min(1, 'Respuesta requerida'),
  p12_personas_dedicadas: z.string().min(1, 'Respuesta requerida'),
  p13_presupuesto: z.string().min(1, 'Respuesta requerida'),
  
  // Datos
  p14_recopilacion: z.string().min(1, 'Respuesta requerida'),
  p15_control_interno: z.string().min(1, 'Respuesta requerida'),
  p16_datos_auditables: z.string().min(1, 'Respuesta requerida'),
  p17_rastreo_impacto: z.string().min(1, 'Respuesta requerida'),
  
  // Necesidades
  p18_obstaculo: z.string().min(1, 'Respuesta requerida'),
  p19_apoyo_valioso: z.array(z.string()).min(1, 'Selecciona al menos una opción').max(2, 'Máximo 2 opciones'),
  p20_inversion: z.string().min(1, 'Respuesta requerida'),
});

const FormWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoringResult, setScoringResult] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      pais_telefono: '',
      telefono: '',
      organizacion: '',
      puesto: '',
      pais: '',
      departamento: '',
      anios_experiencia: '',
      p1_sector: '',
      sector_otro: '',
      p2_tamano: '',
      p3_motivacion: '',
      p4_plazo: '',
      p5_publica_info: '',
      p6_materialidad: '',
      p7_familiaridad: '',
      p8_riesgos_clima: '',
      p9_huella_carbono: '',
      p10_liderazgo: '',
      p11_junta: '',
      p12_personas_dedicadas: '',
      p13_presupuesto: '',
      p14_recopilacion: '',
      p15_control_interno: '',
      p16_datos_auditables: '',
      p17_rastreo_impacto: '',
      p18_obstaculo: '',
      p19_apoyo_valioso: [],
      p20_inversion: '',
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
        return ['nombre', 'apellidos', 'email', 'pais_telefono', 'telefono', 'organizacion', 'puesto', 'pais', 'departamento', 'anios_experiencia'];
      case 2:
        return ['p1_sector', 'p2_tamano', 'p3_motivacion', 'p4_plazo'];
      case 3:
        return ['p5_publica_info', 'p6_materialidad', 'p7_familiaridad', 'p8_riesgos_clima', 'p9_huella_carbono'];
      case 4:
        return ['p10_liderazgo', 'p11_junta', 'p12_personas_dedicadas', 'p13_presupuesto'];
      case 5:
        return ['p14_recopilacion', 'p15_control_interno', 'p16_datos_auditables', 'p17_rastreo_impacto'];
      case 6:
        return ['p18_obstaculo', 'p19_apoyo_valioso', 'p20_inversion'];
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
      // Calcular scoring AQUÍ (primera vez)
      const scoring = calcularScoringCompleto(data);
      
      // Preparar datos para enviar
      const submitData = {
        nombre_completo: `${data.nombre} ${data.apellidos}`,
        email: data.email,
        telefono: data.telefono,
        organizacion: data.organizacion,
        puesto: data.puesto,
        pais: data.pais,
        departamento: data.departamento,
        anios_experiencia: data.anios_experiencia,
        p1_sector: data.p1_sector === 'Otro' ? data.sector_otro : data.p1_sector,
        p2_tamano: data.p2_tamano,
        p3_motivacion: data.p3_motivacion,
        p4_plazo: data.p4_plazo,
        p5_publica_info: data.p5_publica_info,
        p6_materialidad: data.p6_materialidad,
        p7_familiaridad: data.p7_familiaridad,
        p8_riesgos_clima: data.p8_riesgos_clima,
        p9_huella_carbono: data.p9_huella_carbono,
        p10_liderazgo: data.p10_liderazgo,
        p11_junta: data.p11_junta,
        p12_personas_dedicadas: data.p12_personas_dedicadas,
        p13_presupuesto: data.p13_presupuesto,
        p14_recopilacion: data.p14_recopilacion,
        p15_control_interno: data.p15_control_interno,
        p16_datos_auditables: data.p16_datos_auditables,
        p17_rastreo_impacto: data.p17_rastreo_impacto,
        p18_obstaculo: data.p18_obstaculo,
        p19_apoyo_valioso: data.p19_apoyo_valioso,
        p20_inversion: data.p20_inversion,
        scoring: scoring,
      };

      const response = await axios.post(`${API}/diagnostico`, submitData);

      if (response.data) {
        // Clear localStorage
        localStorage.removeItem('clarisa_diagnostico_draft');
        
        // Guardar datos para página de confirmación
        setScoringResult(scoring);
        setUserEmail(data.email);
        setUserName(`${data.nombre} ${data.apellidos}`);
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

  if (isSubmitted && scoringResult) {
    return (
      <ConfirmationPage 
        email={userEmail} 
        nombre={userName}
        scoring={scoringResult}
      />
    );
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