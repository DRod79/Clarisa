// Fases de implementación NIIF S1/S2 — fuente única usada por la Hoja de Ruta
// (sección del cliente) y por la Hoja de Ruta personalizada del resultado del diagnóstico.

export const FASES = [
  {
    numero: 1,
    nombre: 'Diagnóstico Inicial',
    descripcion: 'Evalúa el estado actual de tu organización',
    color: 'blue',
    duracion: '2-4 semanas',
    recursos_clave: ['Guía de Diagnóstico', 'Template de Autoevaluación'],
  },
  {
    numero: 2,
    nombre: 'Análisis de Materialidad',
    descripcion: 'Identifica temas ESG materiales para tu negocio',
    color: 'purple',
    duracion: '3-6 semanas',
    recursos_clave: ['Guía de Materialidad', 'Matriz de Materialidad'],
  },
  {
    numero: 3,
    nombre: 'Identificación de Riesgos',
    descripcion: 'Evalúa riesgos climáticos físicos y de transición',
    color: 'orange',
    duracion: '2-4 semanas',
    recursos_clave: ['Guía de Riesgos', 'Matriz de Riesgos'],
  },
  {
    numero: 4,
    nombre: 'Medición y Cálculo',
    descripcion: 'Calcula tu huella de carbono y métricas clave',
    color: 'green',
    duracion: '4-8 semanas',
    recursos_clave: ['Guía de Huella de Carbono', 'Calculadora GEI'],
  },
  {
    numero: 5,
    nombre: 'Reporte y Divulgación',
    descripcion: 'Prepara y publica tus reportes NIIF S1/S2',
    color: 'indigo',
    duracion: '4-6 semanas',
    recursos_clave: ['Template NIIF S1', 'Template NIIF S2'],
  },
];
