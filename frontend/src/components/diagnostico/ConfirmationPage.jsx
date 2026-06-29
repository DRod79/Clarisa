import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, MapPin, Gauge, LifeBuoy, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getTextoExplicativo, generarHojaDeRuta } from '@/utils/scoring';
import { FASES } from '@/utils/fases';

const ConfirmationPage = ({ email, nombre, scoring }) => {
  const navigate = useNavigate();
  const [animatedScores, setAnimatedScores] = useState({
    urgencia: 0,
    madurez: 0,
    capacidad: 0
  });

  // Animación de las barras de progreso
  useEffect(() => {
    if (!scoring) return;

    const animateScore = (dimension, targetValue, delay) => {
      setTimeout(() => {
        let currentValue = 0;
        const increment = targetValue / 50; // 50 frames para suavidad
        
        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
          }
          
          setAnimatedScores(prev => ({
            ...prev,
            [dimension]: Math.round(currentValue)
          }));
        }, 20); // 20ms por frame = animación de ~1 segundo
      }, delay);
    };

    // Animar cada barra con delay escalonado
    animateScore('urgencia', scoring.urgencia.puntos, 300);
    animateScore('madurez', scoring.madurez.puntos, 600);
    animateScore('capacidad', scoring.capacidad.puntos, 900);
  }, [scoring]);

  // Función para obtener color según el nivel
  const getColorClass = (nivel) => {
    switch (nivel) {
      case 'ALTO':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'MEDIO':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'BAJO':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-gray-400';
    }
  };

  // Componente de barra de progreso animada
  const AnimatedProgressBar = ({ dimension, score, nivel, categoria }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          {dimension}
        </h4>
        <div className="text-2xl font-bold text-gray-900">
          {score}/100
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${getColorClass(nivel)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">{categoria}</p>
        <p className="text-sm text-gray-600">
          {getTextoExplicativo(dimension.toLowerCase(), nivel)}
        </p>
      </div>
    </div>
  );

  if (!scoring) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error al cargar resultados</h1>
          <p className="text-gray-600 mt-2">No se pudo cargar la información del diagnóstico.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const hojaRuta = generarHojaDeRuta(scoring);
  const faseColor = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div data-testid="confirmation-page" className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header con check animado */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-8 py-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            ¡Diagnóstico completado!
          </h1>
          <p className="text-lg text-gray-600">
            Excelente, <span className="font-semibold text-gray-900">{nombre}</span>. 
            Aquí está tu perfil preliminar de preparación NIIF S1 y S2:
          </p>
        </div>

        {/* Sección de Scoring */}
        <div className="px-8 py-8">
          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              TU NIVEL DE PREPARACIÓN
            </h2>

            <div className="space-y-8">
              <AnimatedProgressBar
                dimension="URGENCIA"
                score={animatedScores.urgencia}
                nivel={scoring.urgencia.nivel}
                categoria={scoring.urgencia.categoria}
              />
              
              <AnimatedProgressBar
                dimension="MADUREZ"
                score={animatedScores.madurez}
                nivel={scoring.madurez.nivel}
                categoria={scoring.madurez.categoria}
              />
              
              <AnimatedProgressBar
                dimension="CAPACIDAD"
                score={animatedScores.capacidad}
                nivel={scoring.capacidad.nivel}
                categoria={scoring.capacidad.categoria}
              />
            </div>

            {/* Arquetipo */}
            <div className="mt-8 p-6 bg-white rounded-lg border-2 border-green-200">
              <div className="text-center space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  {scoring.arquetipo.codigo}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Tu perfil: "{scoring.arquetipo.nombre}"
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {scoring.arquetipo.descripcion}
                </p>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm font-medium text-green-800">
                    <span className="font-semibold">Recomendación:</span> {scoring.arquetipo.recomendacion}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ====================================================================
            BLOQUES OCULTOS TEMPORALMENTE (a pedido del cliente):
            - "En 48 horas recibirás a: ..." (informe + email)
            - "Mientras tanto, descarga recursos gratuitos" (3 tarjetas)
            Para restaurarlos, descomenta este bloque y elimina la sección
            "Hoja de Ruta personalizada" de abajo.
        ===================================================================== */}
        {/*
        <div className="bg-gray-50 px-8 py-6">
          ... bloque "En 48 horas recibirás a:" ...
        </div>
        <div className="px-8 py-8">
          ... bloque "Mientras tanto, descarga recursos gratuitos:" ...
        </div>
        */}

        {/* ====================== HOJA DE RUTA PERSONALIZADA ====================== */}
        <div data-testid="hoja-de-ruta-section" className="px-8 py-8 bg-gray-50">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Tu Hoja de Ruta personalizada</h3>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{hojaRuta.intro}</p>
          </div>

          {/* Resumen adaptado: inicio, ritmo, apoyo */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2 text-[#2D5F3F]">
                <MapPin className="h-5 w-5" />
                <h4 className="font-semibold">Punto de partida</h4>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Fase {hojaRuta.faseInicioNumero}: {FASES[hojaRuta.faseInicioNumero - 1]?.nombre}
              </p>
              <p className="text-sm text-gray-600 mt-1">{hojaRuta.faseInicioMensaje}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2 text-[#2D5F3F]">
                <Gauge className="h-5 w-5" />
                <h4 className="font-semibold">{hojaRuta.ritmoTitulo}</h4>
              </div>
              <p className="text-sm text-gray-600">{hojaRuta.ritmoDetalle}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2 text-[#2D5F3F]">
                <LifeBuoy className="h-5 w-5" />
                <h4 className="font-semibold">Nivel de apoyo</h4>
              </div>
              <p className="text-sm text-gray-600">{hojaRuta.apoyoTexto}</p>
            </Card>
          </div>

          {/* Las 5 fases */}
          <div className="max-w-3xl mx-auto space-y-4">
            {FASES.map((fase) => {
              const esInicio = fase.numero === hojaRuta.faseInicioNumero;
              const previa = fase.numero < hojaRuta.faseInicioNumero;
              return (
                <div
                  key={fase.numero}
                  data-testid={`hoja-ruta-fase-${fase.numero}`}
                  className={`flex items-start gap-4 bg-white rounded-lg border p-4 ${
                    esInicio ? 'border-[#4CAF50] ring-1 ring-[#4CAF50]' : 'border-gray-200'
                  } ${previa ? 'opacity-70' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${faseColor[fase.color] || 'bg-gray-400'}`}
                  >
                    {fase.numero}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{fase.nombre}</h4>
                      <span className="text-xs text-gray-500">· {fase.duracion}</span>
                      {esInicio && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-[#4CAF50] text-white rounded-full">
                          Empieza aquí
                        </span>
                      )}
                      {previa && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          Puedes avanzar rápido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{fase.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA: crear cuenta para guardar (única acción, sin botones que requieran login) */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate('/acceso')}
              data-testid="crear-cuenta-hoja-ruta-btn"
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-base font-semibold px-8 py-6 rounded-lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Crear cuenta para guardar mi Hoja de Ruta
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Crea tu cuenta gratuita para guardar tu progreso y acceder a los recursos de cada fase.
            </p>
          </div>
        </div>

        {/* Footer de contacto */}
        <div className="bg-gray-50 px-8 py-6 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Mail className="h-5 w-5" />
              <span>¿Tienes alguna pregunta urgente?</span>
            </div>
            <p className="text-gray-600">
              Escríbenos:{' '}
              <a
                href="mailto:hola@clarisa.com"
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                hola@clarisa.com
              </a>
            </p>
            <p className="text-sm text-gray-500">(Respondemos en menos de 24 horas)</p>
            
            <Button
              onClick={() => navigate('/')}
              data-testid="back-to-home-btn"
              variant="outline"
              className="mt-4"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;