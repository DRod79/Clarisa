import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Users, FileDown, BookOpen, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getTextoExplicativo } from '@/utils/scoring';

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

        {/* Información del informe */}
        <div className="bg-gray-50 px-8 py-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              En 48 horas recibirás a:
            </h3>
            <div className="text-lg font-semibold text-green-600 bg-white px-4 py-2 rounded-lg border">
              {email}
            </div>
            <div className="text-left bg-white p-6 rounded-lg border max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-900 mb-3">Tu informe completo NIIF S1 y S2 con:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  Análisis detallado de cada dimensión
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  Tus 5 brechas más críticas priorizadas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  Hoja de ruta de 6 meses paso a paso
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  Comparación con tu sector y región
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">→</span>
                  Plantillas y recursos recomendados
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recursos mientras tanto */}
        <div className="px-8 py-8">
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
            Mientras tanto, descarga recursos gratuitos:
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileDown className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Plantillas Esenciales</h4>
                <p className="text-sm text-gray-600">10 formatos listos para usar</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('#', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar ahora
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Guía de Inicio Rápido NIIF S1 y S2</h4>
                <p className="text-sm text-gray-600">Primeros pasos en NIIF S1 y S2</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('#', '_blank')}
                >
                  Ver guía
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Únete a la Comunidad</h4>
                <p className="text-sm text-gray-600">+500 profesionales implementando NIIF S1 y S2</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('#', '_blank')}
                >
                  Unirse
                </Button>
              </div>
            </Card>
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