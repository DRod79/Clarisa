import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
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

// Validación de nombres (solo letras, espacios, acentos, longitud razonable)
const nombreRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]{2,25}$/;

// Validación de teléfono (solo números, formato ####-####)
const telefonoRegex = /^\d{4}-\d{4}$/;

// Validation schema
const formSchema = z.object({
  // Contacto - campos actualizados con validaciones estrictas
  nombre: z.string()
    .min(2, 'Nombre requerido')
    .max(25, 'Nombre muy largo')
    .regex(nombreRegex, 'Solo letras y espacios permitidos'),
  apellidos: z.string()
    .min(2, 'Apellidos requeridos')
    .max(35, 'Apellidos muy largos')
    .regex(nombreRegex, 'Solo letras y espacios permitidos'),
  email: z.string()
    .email('Email inválido')
    .regex(emailCorporativoRegex, 'Usa tu email corporativo (no gmail, yahoo, hotmail, outlook)'),
  pais_telefono: z.string().min(1, 'Selecciona el país del teléfono'),
  telefono: z.string()
    .regex(telefonoRegex, 'Formato requerido: ####-####')
    .refine((val) => val.replace('-', '').length === 8, 'Debe tener 8 dígitos'),
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
  const { user, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoringResult, setScoringResult] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);

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

  // Save to localStorage on change (con timestamp)
  useEffect(() => {
    const subscription = watch((data) => {
      const dataWithTimestamp = {
        ...data,
        _savedAt: new Date().toISOString()
      };
      localStorage.setItem('clarisa_diagnostico_draft', JSON.stringify(dataWithTimestamp));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Load from localStorage on mount (solo si no hay datos previos)
  useEffect(() => {
    const saved = localStorage.getItem('clarisa_diagnostico_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Solo cargar si es de la sesión actual (menos de 1 hora)
        const savedTime = new Date(data._savedAt || 0);
        const now = new Date();
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) {
          Object.keys(data).forEach((key) => {
            if (key !== '_savedAt') {
              form.setValue(key, data[key]);
            }
          });
        } else {
          // Si es muy viejo, limpiar
          localStorage.removeItem('clarisa_diagnostico_draft');
        }
      } catch (e) {
        console.error('Error loading saved data', e);
        localStorage.removeItem('clarisa_diagnostico_draft');
      }
    }
    
    // SIEMPRE limpiar campos específicos que causan problemas
    form.setValue('pais', '');
    form.setValue('pais_telefono', '');
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

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data) => {
    console.log('Form onSubmit triggered with data:', data);
    setIsSubmitting(true);

    try {
      // Calcular scoring
      console.log('Calculating scoring...');
      const scoring = calcularScoringCompleto(data);
      console.log('Scoring calculated:', scoring);

      // Si el usuario está autenticado, verificar si ya tiene un diagnóstico
      if (user) {
        console.log('User is authenticated, checking for existing diagnostico...');
        const { data: existingDiag, error: checkError } = await supabase
          .from('diagnosticos')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (checkError) {
          console.error('Error checking existing diagnostico:', checkError);
        }

        if (existingDiag && existingDiag.length > 0) {
          console.log('User already has a diagnostico');
          toast.info('Ya tienes un diagnóstico registrado. Actualizando...');
        }
      } else {
        console.log('User is NOT authenticated (anonymous diagnostico)');
      }
      
      console.log('Step 1: Preparing respuestas object...');
      
      // Preparar respuestas
      const respuestas = {
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        telefono: data.telefono,
        pais_telefono: data.pais_telefono,
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
      };

      // Guardar en Supabase
      const diagnosticoData = {
        user_id: user?.id || null,
        respuestas: respuestas,
        scoring: scoring,
        arquetipo: scoring.arquetipo.codigo,
        urgencia_puntos: scoring.urgencia.puntos,
        madurez_puntos: scoring.madurez.puntos,
        capacidad_puntos: scoring.capacidad.puntos,
      };

      console.log('Saving to Supabase...');
      const { data: savedDiag, error } = await supabase
        .from('diagnosticos')
        .insert([diagnosticoData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Diagnostico saved:', savedDiag);

      // Si el usuario está autenticado, actualizar su información
      if (user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            nombre_completo: `${data.nombre} ${data.apellidos}`,
            organizacion: data.organizacion,
            puesto: data.puesto,
            pais: data.pais,
            departamento: data.departamento,
            telefono: data.telefono,
            pais_telefono: data.pais_telefono,
            anios_experiencia: data.anios_experiencia,
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating user:', updateError);
        }
      }

      // LIMPIAR localStorage
      localStorage.removeItem('clarisa_diagnostico_draft');
      
      // Guardar datos para página de confirmación
      setScoringResult(scoring);
      setUserEmail(data.email);
      setUserName(`${data.nombre} ${data.apellidos}`);
      setIsSubmitted(true);
      
      toast.success('¡Diagnóstico NIIF S1 y S2 enviado exitosamente!');

      // Si el usuario está autenticado, redirigir al dashboard después de 3 segundos
      if (user) {
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 3000);
      }

      console.log('Form submission completed successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el diagnóstico. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showDuplicateMessage) {
    const diagnosticoUrl = window.location.origin + '/diagnostico';
    const shareMessage = 'Te comparto este diagnóstico NIIF S1 y S2 que puede ser muy valioso para ti o tu organización. ¡Échale un vistazo!';
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + diagnosticoUrl)}`;
    
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8" data-testid="duplicate-message">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            ¡Gracias por tu interés en NIIF S1 y S2!
          </h1>

          {/* Message */}
          <div className="space-y-4 text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            <p>
              Según nuestros registros, ya has completado un diagnóstico NIIF S1 y S2 previamente con este email.
            </p>
            <p>
              <span className="font-semibold text-gray-900">¿Conoces a alguien que pueda beneficiarse de esta valiosa herramienta?</span>
              {' '}Comparte este enlace con colegas de tu organización o cualquier persona que necesite apoyo para implementar las normas NIIF S1 y S2.
            </p>
          </div>

          {/* Share Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compartir diagnóstico:</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  const mailtoUrl = `mailto:?subject=${encodeURIComponent('Diagnóstico NIIF S1 y S2 - Clarisa')}&body=${encodeURIComponent(shareMessage + '\n\n' + diagnosticoUrl)}`;
                  window.location.href = mailtoUrl;
                }}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Compartir por Email
              </Button>
              <Button
                onClick={() => {
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-[#25D366] hover:bg-[#22c55e] text-white flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Compartir por WhatsApp
              </Button>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              Volver al inicio
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Si tienes preguntas sobre tu diagnóstico previo o necesitas soporte adicional, 
              contáctanos en{' '}
              <a href="mailto:hola@clarisa.com" className="text-[#4CAF50] font-semibold hover:text-[#2D5F3F]">
                hola@clarisa.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          onStepClick={handleStepClick}
        />

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
                type="button"
                data-testid="submit-button"
                disabled={isSubmitting}
                className="bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={async () => {
                  console.log('Submit button clicked - manual trigger');
                  
                  // Validar todos los campos manualmente
                  const allFields = [...getStepFields(1), ...getStepFields(2), ...getStepFields(3), 
                                     ...getStepFields(4), ...getStepFields(5), ...getStepFields(6)];
                  
                  console.log('Validating fields:', allFields);
                  const isValid = await trigger(allFields);
                  console.log('Validation result:', isValid);
                  
                  if (!isValid) {
                    const errors = form.formState.errors;
                    console.log('Validation errors:', errors);
                    toast.error('Por favor completa todos los campos requeridos');
                    return;
                  }
                  
                  // Si la validación pasa, ejecutar submit manualmente
                  const data = form.getValues();
                  console.log('Form data:', data);
                  await onSubmit(data);
                }}
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