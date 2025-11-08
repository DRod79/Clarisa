import React from 'react';
import ConfirmationPage from '@/components/diagnostico/ConfirmationPage';

const TestScoringPage = () => {
  // Datos de prueba con scoring completo
  const testScoring = {
    urgencia: {
      puntos: 75,
      nivel: 'MEDIO',
      categoria: 'PLANIFICACIÓN ACTIVA'
    },
    madurez: {
      puntos: 64,
      nivel: 'MEDIO', 
      categoria: 'INTERMEDIO'
    },
    capacidad: {
      puntos: 65,
      nivel: 'MEDIO',
      categoria: 'NECESITAN APOYO'
    },
    arquetipo: {
      codigo: 'B2',
      nombre: 'Planificador Sólido',
      descripcion: 'Urgencia media, capacidad/madurez medias',
      recomendacion: 'Plataforma Pro ($149/mes)'
    }
  };

  return (
    <ConfirmationPage 
      email="maria.test@empresa.com"
      nombre="María González"
      scoring={testScoring}
    />
  );
};

export default TestScoringPage;