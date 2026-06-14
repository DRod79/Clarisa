import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      data-testid="hero-section"
      className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-50/60 via-white to-white" />
      {/* Soft green blobs */}
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-[#4CAF50]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-10 -right-32 w-[32rem] h-[32rem] bg-[#2D5F3F]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl -z-10" />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(45,95,63,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,95,63,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div
          data-testid="hero-badge"
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#4CAF50]/30 bg-white/70 backdrop-blur-sm text-sm font-medium text-[#2D5F3F] shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse" />
          Estándares de sostenibilidad NIIF S1 / S2
        </div>

        <h1
          data-testid="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
        >
          Implementa NIIF S1 y S2 en{' '}
          <span className="text-[#2D5F3F]">6 meses</span> sin consultoras
          costosas ni proyectos interminables
        </h1>

        <p
          data-testid="hero-subtitle"
          className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
        >
          La plataforma que convierte complejidad en acción clara. Para
          organizaciones latinoamericanas que necesitan reportar sostenibilidad
          con rapidez, confianza y presupuestos reales.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            data-testid="hero-primary-cta"
            onClick={() => navigate('/diagnostico')}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-lg font-semibold px-8 py-6 rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            DIAGNÓSTICO GRATUITO EN 48 HORAS
          </Button>
          <Button
            data-testid="hero-secondary-cta"
            variant="outline"
            onClick={() => {
              const element = document.getElementById('como-funciona');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border-2 border-[#4CAF50] text-[#2D5F3F] text-lg font-semibold px-8 py-6 rounded-lg hover:bg-green-50 transition-colors bg-white/70 backdrop-blur-sm"
          >
            Ver cómo funciona
          </Button>
        </div>

        {/* Trust Indicators */}
        <div
          data-testid="trust-indicators"
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 justify-center items-center"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Informe personalizado gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
            <span>Usado por empresas en LATAM</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;