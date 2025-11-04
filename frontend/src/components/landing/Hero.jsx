import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      data-testid="hero-section"
      className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white to-slate-50 -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <h1
              data-testid="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Implementa NIIF S1 y S2 en{' '}
              <span className="text-[#2D5F3F]">6 meses</span> sin consultoras
              costosas ni proyectos interminables
            </h1>

            <p
              data-testid="hero-subtitle"
              className="text-lg sm:text-xl text-gray-600 leading-relaxed"
            >
              La plataforma que convierte complejidad en acción clara. Para
              organizaciones latinoamericanas que necesitan reportar sostenibilidad
              con rapidez, confianza y presupuestos reales.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                className="border-2 border-[#4CAF50] text-[#2D5F3F] text-lg font-semibold px-8 py-6 rounded-lg hover:bg-green-50 transition-colors"
              >
                Ver cómo funciona
              </Button>
            </div>

            {/* Trust Indicators */}
            <div
              data-testid="trust-indicators"
              className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600"
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

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1728225956024-6d62825a2c09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBzdXN0YWluYWJpbGl0eSUyMHJlcG9ydGluZ3xlbnwwfHx8fDE3NjIyNzM3Nzd8MA&ixlib=rb-4.1.0&q=85"
                alt="Sostenibilidad corporativa moderna"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D5F3F]/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;