import React from 'react';
import { Check, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TargetAudience = () => {
  const criteria = [
    'Tienen entre 50-1000+ empleados',
    'Enfrentan presión regulatoria o de inversionistas',
    'Buscan implementar con equipo interno',
    'Necesitan resultados en 6-12 meses',
    'Prefieren inversión escalable vs proyectos grandes',
    'Valoran independencia sobre dependencia de consultores',
  ];

  const personas = [
    'Director Financiero con timeline ajustado',
    'Responsable de Sostenibilidad con equipo pequeño',
    'Gerente de Riesgos evaluando requisitos',
    'Auditor Interno explorando preparación',
    'Director General buscando ventaja competitiva',
  ];

  return (
    <section
      id="para-quien"
      data-testid="target-audience-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2
            data-testid="target-audience-title"
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            ¿Clarisa es para ti?
          </h2>
          <p className="text-lg text-gray-600">
            Clarisa funciona mejor para organizaciones que:
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Criteria */}
          <Card className="p-8 bg-gradient-to-br from-green-50 to-white">
            <div className="space-y-4">
              {criteria.map((item, index) => (
                <div
                  key={index}
                  data-testid={`criteria-${index}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Right Column - Personas */}
          <Card className="p-8 bg-gradient-to-br from-slate-50 to-white">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="h-6 w-6 text-[#2D5F3F]" />
                <h3 className="text-xl font-bold text-[#2D5F3F]">
                  ESPECIALMENTE ÚTIL SI ERES:
                </h3>
              </div>
              {personas.map((persona, index) => (
                <div
                  key={index}
                  data-testid={`persona-${index}`}
                  className="flex items-start gap-3 pl-2"
                >
                  <span className="text-[#4CAF50] font-bold">•</span>
                  <p className="text-gray-700 leading-relaxed">{persona}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600 italic">
            ¿No estás seguro si Clarisa es para ti? El diagnóstico gratuito te
            lo dirá en 48 horas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;