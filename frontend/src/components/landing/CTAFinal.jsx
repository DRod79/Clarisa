import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const CTAFinal = () => {
  const navigate = useNavigate();

  return (
    <section
      data-testid="cta-final-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 via-green-50/40 to-slate-50 -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2
          data-testid="cta-final-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900"
        >
          Descubre tu nivel de preparación en 48 horas
        </h2>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          El primer paso es entender dónde estás y qué necesitas. Sin costo. Sin
          compromiso. Sin trucos.
        </p>

        <Button
          data-testid="cta-final-button"
          onClick={() => navigate('/diagnostico')}
          className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-lg font-semibold px-12 py-7 rounded-lg transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          INICIAR DIAGNÓSTICO GRATUITO AHORA
        </Button>

        <div
          data-testid="cta-final-indicators"
          className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 pt-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Usado por empresas en LATAM</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Informe personalizado en 48 horas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Sin tarjeta de crédito</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAFinal;