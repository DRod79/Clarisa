// Sistema de Scoring para Diagnóstico NIIF S1/S2

// DIMENSIÓN 1: URGENCIA
export function calcularUrgencia(respuestas) {
  const puntosP3 = {
    'Requerimiento regulatorio actual o próximo': 30,
    'Presión de inversionistas, accionistas o casa matriz': 25,
    'Acceso a financiamiento sostenible o verde': 20,
    'Ventaja competitiva y reputación corporativa': 15,
    'Cadena de suministro lo está solicitando': 20,
    'Convicción propia de la dirección': 10,
    'Aún estamos explorando': 0,
  };

  const puntosP4 = {
    'Ya deberíamos haberlo publicado (estamos retrasados)': 40,
    'Próximos 3-6 meses': 35,
    '6-12 meses': 20,
    'Más de 12 meses': 10,
    'Aún no tenemos plazo definido': 0,
  };

  const puntosP18 = {
    'No sabemos por dónde empezar o cómo priorizar': 30,
    'Falta de recursos humanos o presupuesto': 20,
    'Complejidad técnica de las normas': 25,
    'Falta de datos, sistemas o herramientas': 20,
    'Falta de compromiso interno o prioridad de la dirección': 5,
    'Falta de conocimiento técnico en el equipo': 25,
  };

  const urgencia =
    (puntosP3[respuestas.p3_motivacion] || 0) +
    (puntosP4[respuestas.p4_plazo] || 0) +
    (puntosP18[respuestas.p18_obstaculo] || 0);

  let nivel, categoria;
  if (urgencia >= 80) {
    nivel = 'ALTO';
    categoria = 'CRISIS';
  } else if (urgencia >= 50) {
    nivel = 'MEDIO';
    categoria = 'PLANIFICACIÓN ACTIVA';
  } else {
    nivel = 'BAJO';
    categoria = 'EXPLORACIÓN';
  }

  return {
    puntos: urgencia,
    nivel,
    categoria,
  };
}

// DIMENSIÓN 2: MADUREZ
export function calcularMadurez(respuestas) {
  const puntosP5 = {
    'Sí, tenemos informe integrado o de sostenibilidad publicado anualmente': 25,
    'Sí, pero solo internamente o para grupos de interés específicos': 20,
    'Reportamos parcialmente (solo temas ambientales o sociales)': 15,
    'No, este será nuestro primer informe': 5,
    'No lo sé': 0,
  };

  const puntosP6 = {
    'Sí, tenemos materialidad definida, documentada y aprobada': 25,
    'Lo hicimos hace más de 2 años (necesita actualización)': 15,
    'Estamos en proceso de realizarlo': 10,
    'No, no sabemos cómo hacerlo': 0,
    '¿Qué es el análisis de materialidad?': 0,
  };

  const puntosP7 = {
    'Alto: Hemos tomado cursos y entendemos los requisitos': 20,
    'Medio: Hemos leído las normas pero tenemos dudas': 15,
    'Bajo: Solo conocemos lo básico por artículos o menciones': 5,
    'Nulo: Estamos empezando desde cero': 0,
  };

  const puntosP8 = {
    'Sí, tenemos registro detallado y cuantificado': 20,
    'Parcialmente, pero no están cuantificados ni priorizados': 10,
    'No, aún no los hemos identificado de manera sistemática': 0,
    'No aplica a nuestro sector': 0,
  };

  const puntosP9 = {
    'Sí, los 3 alcances con verificación externa': 20,
    'Sí, pero solo Alcance 1 y 2': 15,
    'Hemos medido alguna vez pero no de forma continua': 10,
    'No, pero sabemos cómo calcularlo': 5,
    'No, necesitamos ayuda para empezar': 0,
  };

  const madurezRaw =
    (puntosP5[respuestas.p5_publica_info] || 0) +
    (puntosP6[respuestas.p6_materialidad] || 0) +
    (puntosP7[respuestas.p7_familiaridad] || 0) +
    (puntosP8[respuestas.p8_riesgos_clima] || 0) +
    (puntosP9[respuestas.p9_huella_carbono] || 0);

  // Normalizar: máximo posible es 110, convertir a 100
  const madurez = Math.round((madurezRaw / 110) * 100);

  let nivel, categoria;
  if (madurez >= 80) {
    nivel = 'ALTO';
    categoria = 'AVANZADO';
  } else if (madurez >= 50) {
    nivel = 'MEDIO';
    categoria = 'INTERMEDIO';
  } else {
    nivel = 'BAJO';
    categoria = 'PRINCIPIANTE';
  }

  return {
    puntos: madurez,
    nivel,
    categoria,
  };
}

// DIMENSIÓN 3: CAPACIDAD
export function calcularCapacidad(respuestas) {
  const puntosP10 = {
    'Dirección General o Gerencia General directamente': 15,
    'Área específica de Sostenibilidad o Responsabilidad Social': 15,
    'Área de Riesgos, Cumplimiento o Legal': 10,
    'Área Financiera o Contable': 10,
    'Múltiples áreas sin claridad de responsabilidad': 5,
    'Nadie formalmente asignado': 0,
  };

  const puntosP11 = {
    'Sí, hay comité específico y reportes regulares': 15,
    'Sí, se reporta ocasionalmente en sesiones': 10,
    'No, pero están solicitando información': 5,
    'No, no es prioridad aún para el nivel directivo': 0,
  };

  const puntosP12 = {
    '3 o más personas con dedicación completa': 15,
    '1-2 personas con dedicación completa': 10,
    'Tiempo parcial de varias personas (menos del 50% de su tiempo)': 5,
    'Nadie dedicado (0 personas asignadas)': 0,
  };

  const puntosP13 = {
    'Sí, presupuesto aprobado para año calendario': 15,
    'En proceso de aprobación o negociación': 5,
    'No, aún no hemos presupuestado nada': 0,
  };

  const puntosP14 = {
    'Sistema integrado de gestión o plataforma especializada': 10,
    'Hojas de cálculo centralizadas con proceso definido': 8,
    'Hojas de cálculo descentralizadas sin proceso estándar': 3,
    'No recopilamos de manera sistemática': 0,
    'No lo sé': 0,
  };

  const puntosP15 = {
    'Sí, con controles y revisiones establecidas similares a datos financieros': 10,
    'Parcialmente, estamos desarrollándolos': 5,
    'No, solo tenemos controles para datos financieros': 0,
    'No lo sé o no estoy seguro': 0,
  };

  const puntosP16 = {
    'Sí, ya tenemos verificación externa de nuestros datos': 10,
    'Casi, necesitamos mejoras menores en documentación': 7,
    'No, necesitamos trabajo significativo en calidad y trazabilidad de datos': 3,
    'No lo sé o no hemos evaluado esto': 0,
  };

  const puntosP17 = {
    'Tenemos sistemas que lo permiten con relativa facilidad': 10,
    'Es posible pero requiere trabajo manual significativo': 5,
    'Muy difícil, no tenemos esa granularidad de información': 0,
    'No lo hemos intentado o no sabemos cómo hacerlo': 0,
  };

  const capacidad =
    (puntosP10[respuestas.p10_liderazgo] || 0) +
    (puntosP11[respuestas.p11_junta] || 0) +
    (puntosP12[respuestas.p12_personas_dedicadas] || 0) +
    (puntosP13[respuestas.p13_presupuesto] || 0) +
    (puntosP14[respuestas.p14_recopilacion] || 0) +
    (puntosP15[respuestas.p15_control_interno] || 0) +
    (puntosP16[respuestas.p16_datos_auditables] || 0) +
    (puntosP17[respuestas.p17_rastreo_impacto] || 0);

  let nivel, categoria;
  if (capacidad >= 80) {
    nivel = 'ALTO';
    categoria = 'LISTOS PARA EJECUTAR';
  } else if (capacidad >= 50) {
    nivel = 'MEDIO';
    categoria = 'NECESITAN APOYO';
  } else {
    nivel = 'BAJO';
    categoria = 'BRECHAS MAYORES';
  }

  return {
    puntos: capacidad,
    nivel,
    categoria,
  };
}

// DETERMINACIÓN DE ARQUETIPO
export function determinarArquetipo(urgencia, madurez, capacidad) {
  const nivelUrgencia = urgencia.nivel;
  const nivelMadurez = madurez.nivel;
  const nivelCapacidad = capacidad.nivel;

  // Matriz 3x3
  const letra = nivelUrgencia === 'ALTO' ? 'A' : nivelUrgencia === 'MEDIO' ? 'B' : 'C';

  let numero;
  if (nivelCapacidad === 'BAJO' && nivelMadurez === 'BAJO') {
    numero = '1';
  } else if (nivelCapacidad === 'MEDIO' || nivelMadurez === 'MEDIO') {
    numero = '2';
  } else {
    numero = '3';
  }

  const arquetipos = {
    A1: {
      nombre: 'Necesitas Empezar Ya',
      descripcion: 'Tienes poco tiempo y estás comenzando desde cero. Es normal sentirse abrumado en esta etapa, pero con la guía correcta puedes avanzar rápido.',
      recomendacion: 'En este momento, lo más valioso es contar con acompañamiento experto cercano y constante. Rescate Express te ayuda a priorizar qué hacer primero y te guía paso a paso, para no perder tiempo valioso en un camino que ya tiene poco margen.',
    },
    A2: {
      nombre: 'Vas por Buen Camino, Acelera',
      descripcion: 'Tienes presión de tiempo, pero ya cuentas con bases sólidas. Estás más cerca de lo que crees.',
      recomendacion: 'Te conviene mantener el ritmo con compañía constante. Acompañamiento Continuo te da encuentros regulares con un experto para destrabar puntos críticos rápidamente, sin necesitar que te expliquen todo desde cero.',
    },
    A3: {
      nombre: 'Estás Muy Cerca de Lograrlo',
      descripcion: 'Tienes urgencia, pero también tienes el conocimiento y la capacidad. Solo te falta el último empujón.',
      recomendacion: 'Lo que más te aporta ahora es una revisión experta puntual. Acompañamiento Continuo (modalidad de validación) confirma que vas en la dirección correcta para que cruces la meta con confianza.',
    },
    B1: {
      nombre: 'Estás Empezando con Calma',
      descripcion: 'Tienes tiempo para planificar, aunque estás iniciando desde un punto básico. Esta es una gran oportunidad para construir bases sólidas sin presión.',
      recomendacion: 'Aprovecha este tiempo con acompañamiento experto que te enseñe los fundamentos paso a paso. Ruta Guiada te ayuda a construir una base sólida y bien guiada antes de que llegue el momento de actuar con urgencia.',
    },
    B2: {
      nombre: 'Tienes Buenas Bases para Avanzar',
      descripcion: 'Cuentas con tiempo y con conocimientos intermedios. Estás en una posición cómoda para seguir creciendo.',
      recomendacion: 'Un acompañamiento puntual puede ayudarte a resolver dudas específicas y profundizar donde sientes menos seguridad. Acompañamiento Continuo te da esa orientación sin necesitar supervisión constante.',
    },
    B3: {
      nombre: 'Estás Listo para Perfeccionar',
      descripcion: 'Tienes tiempo, capacidad y madurez. Ya tienes mucho del camino recorrido.',
      recomendacion: 'Te beneficia más una mirada experta externa que revise y perfeccione lo que ya construiste. Acompañamiento Continuo te da ese seguimiento enfocado en detalles finos, sin volver a lo básico.',
    },
    C1: {
      nombre: 'Estás Comenzando a Explorar',
      descripcion: 'Aún no tienes presión de tiempo y estás dando tus primeros pasos. No hay prisa, y eso es una ventaja para aprender bien desde el inicio.',
      recomendacion: 'No necesitas apoyo experto intensivo todavía. Este es el momento de informarte con calma a través de contenido gratuito, o si quieres dar un primer paso estructurado, nuestro Taller Fundamentos NIIF de Sostenibilidad te da una introducción clara antes de decidir tu siguiente paso.',
    },
    C2: {
      nombre: 'Tienes una Base para Crecer',
      descripcion: 'No sientes urgencia todavía, pero ya cuentas con algunos conocimientos. Es un buen momento para seguir construyendo.',
      recomendacion: 'Puedes seguir avanzando por tu cuenta con contenido gratuito, o reforzar lo que ya sabes con nuestro Taller Fundamentos NIIF de Sostenibilidad. Si en algún momento te trabas en un tema específico, ahí es donde el acompañamiento experto puntual tendría más sentido.',
    },
    C3: {
      nombre: 'Ya Estás Preparado, Cuando Quieras Avanzar',
      descripcion: 'No tienes presión de tiempo, pero ya tienes el conocimiento y la capacidad necesaria. Estás listo para cuando decidas dar el siguiente paso.',
      recomendacion: 'Probablemente no necesites acompañamiento aún. Mantente informado, y cuando decidas avanzar, Acompañamiento Continuo (modalidad de validación) será suficiente para confirmar que tu enfoque es correcto.',
    },
  };

  const codigo = letra + numero;
  return {
    codigo,
    ...arquetipos[codigo],
  };
}

// FUNCIÓN PRINCIPAL DE SCORING
export function calcularScoringCompleto(respuestas) {
  const urgencia = calcularUrgencia(respuestas);
  const madurez = calcularMadurez(respuestas);
  const capacidad = calcularCapacidad(respuestas);
  const arquetipo = determinarArquetipo(urgencia, madurez, capacidad);

  return {
    urgencia,
    madurez,
    capacidad,
    arquetipo,
  };
}

// Textos explicativos por nivel
export function getTextoExplicativo(dimension, nivel) {
  const textos = {
    urgencia: {
      ALTO: 'Necesitas implementar urgentemente',
      MEDIO: 'Tienes un plazo definido para implementar',
      BAJO: 'Puedes planificar con tiempo',
    },
    madurez: {
      ALTO: 'Tu organización tiene bases sólidas',
      MEDIO: 'Tienes conocimiento básico pero con brechas importantes',
      BAJO: 'Estás empezando desde cero o casi cero',
    },
    capacidad: {
      ALTO: 'Tienes recursos y estructura para ejecutar',
      MEDIO: 'Tienes algunos elementos pero necesitas reforzar',
      BAJO: 'Requieres construcción de capacidades internas',
    },
  };

  return textos[dimension]?.[nivel] || '';
}