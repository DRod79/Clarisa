import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: '¿Qué incluye el diagnóstico gratuito?',
      answer:
        'El diagnóstico incluye: (1) Análisis personalizado de tu nivel de preparación actual en NIIF S1/S2, (2) Identificación de tus 5 brechas más críticas, (3) Hoja de ruta personalizada con pasos concretos, (4) Comparación con organizaciones similares de tu sector. Lo recibes por email en 48 horas, sin costo ni compromiso.',
    },
    {
      question: '¿Cómo es diferente de contratar una consultora?',
      answer:
        'Las consultoras tradicionales cuestan $150K+ y toman 18-24 meses, dejando poco conocimiento interno. Clarisa te enseña a implementar con tu equipo por $1K-10K en 6 meses. Tú mantienes el control, desarrollas capacidades internas y puedes escalar la inversión según necesites. Es aprendizaje aplicado, no dependencia eterna.',
    },
    {
      question: '¿Realmente puedo implementar en 6 meses?',
      answer:
        'Sí, si tu organización ya tiene datos básicos de operaciones y sostenibilidad. El plazo de 6 meses es realista para publicar tu primer informe S1/S2, no perfecto pero conforme. La clave es priorizar lo esencial, usar plantillas probadas y avanzar en paralelo. Clarisa te guía semana a semana para mantener el ritmo sin sacrificar calidad.',
    },
    {
      question: '¿Necesito conocimiento previo de sostenibilidad o NIIF?',
      answer:
        'No es necesario. Clarisa está diseñada para equipos que empiezan desde cero. Todo el contenido asume que no conoces las normas y te explica desde lo básico hasta lo avanzado. Si ya tienes experiencia en reporteo de sostenibilidad, avanzarás más rápido, pero no es requisito.',
    },
    {
      question: '¿Qué pasa si tengo dudas durante la implementación?',
      answer:
        'Tienes múltiples vías de apoyo: (1) Comunidad de practicantes donde puedes preguntar 24/7, (2) Sesiones grupales mensuales de Q&A con expertos, (3) Base de conocimiento con casos resueltos, (4) Soporte por email. Para dudas complejas o validaciones críticas, puedes contratar acompañamiento experto por separado.',
    },
    {
      question: '¿Funciona para mi sector/país/tamaño?',
      answer:
        'Clarisa funciona para cualquier organización de 50+ empleados en Latinoamérica, independiente del sector. Las normas NIIF S1/S2 son universales, pero tenemos contenido y plantillas adaptadas para sectores de alto impacto (energía, manufactura, finanzas, etc.). El diagnóstico te dirá específicamente qué tan adecuado es para tu caso.',
    },
  ];

  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          data-testid="faq-title"
          className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          Preguntas frecuentes
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              data-testid={`faq-item-${index}`}
              className="bg-white border border-gray-200 rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#2D5F3F] py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;