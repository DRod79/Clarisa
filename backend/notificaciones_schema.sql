-- ====================================
-- SCHEMA: Sistema de Notificaciones
-- ====================================

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'nuevo_recurso', 'fase_completada', 'recordatorio', 'respuesta_ticket', 'sistema'
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    link TEXT, -- URL a donde debe redirigir al hacer clic
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leida_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_notificaciones_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id ON public.notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON public.notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at DESC);

-- ====================================
-- SCHEMA: Centro de Ayuda - FAQs
-- ====================================

-- Tabla de categorías de FAQs
CREATE TABLE IF NOT EXISTS public.faq_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50), -- Nombre del ícono de lucide-react
    orden INTEGER DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    vistas INTEGER DEFAULT 0,
    util_si INTEGER DEFAULT 0,
    util_no INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_faqs_categoria FOREIGN KEY (categoria_id) REFERENCES faq_categorias(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_faqs_categoria ON public.faqs(categoria_id);
CREATE INDEX IF NOT EXISTS idx_faqs_visible ON public.faqs(visible);

-- ====================================
-- SCHEMA: Sistema de Tickets/Soporte
-- ====================================

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS public.tickets_soporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asunto TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'tecnico', 'facturacion', 'contenido', 'general'
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'normal', -- 'baja', 'normal', 'alta', 'urgente'
    estado VARCHAR(20) DEFAULT 'abierto', -- 'abierto', 'en_proceso', 'resuelto', 'cerrado'
    asignado_a UUID, -- ID del admin que lo atiende
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resuelto_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_asignado FOREIGN KEY (asignado_a) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de mensajes/respuestas en tickets
CREATE TABLE IF NOT EXISTS public.tickets_mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    user_id UUID NOT NULL,
    mensaje TEXT NOT NULL,
    es_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_mensajes_ticket FOREIGN KEY (ticket_id) REFERENCES tickets_soporte(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets_soporte(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets_soporte(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_mensajes_ticket ON public.tickets_mensajes(ticket_id);

-- ====================================
-- DATOS INICIALES: Categorías de FAQ
-- ====================================

INSERT INTO public.faq_categorias (id, nombre, descripcion, icono, orden) VALUES
('11111111-1111-1111-1111-111111111111', 'Primeros Pasos', 'Información básica para comenzar con NIIF S1/S2', 'Rocket', 1),
('22222222-2222-2222-2222-222222222222', 'Diagnóstico', 'Preguntas sobre la fase de diagnóstico', 'Search', 2),
('33333333-3333-3333-3333-333333333333', 'Materialidad', 'Preguntas sobre análisis de materialidad', 'Filter', 3),
('44444444-4444-4444-4444-444444444444', 'Medición y Reporte', 'Preguntas sobre cálculo y reportes', 'BarChart', 4),
('55555555-5555-5555-5555-555555555555', 'Técnico', 'Problemas técnicos y uso de la plataforma', 'Settings', 5),
('66666666-6666-6666-6666-666666666666', 'Suscripción', 'Preguntas sobre planes y facturación', 'CreditCard', 6)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- DATOS INICIALES: FAQs de Ejemplo
-- ====================================

INSERT INTO public.faqs (categoria_id, pregunta, respuesta, orden, visible) VALUES
-- Primeros Pasos
('11111111-1111-1111-1111-111111111111', '¿Qué son los estándares NIIF de sostenibilidad?', 'Los estándares NIIF de sostenibilidad son normas internacionales desarrolladas por el ISSB (International Sustainability Standards Board) para divulgar información relacionada con sostenibilidad que sea útil para los inversionistas.', 1, true),
('11111111-1111-1111-1111-111111111111', '¿Cuál es la diferencia entre NIIF S1 y S2?', 'NIIF S1 establece los requisitos generales para divulgación de información de sostenibilidad (estructura, gobernanza, estrategia, métricas). NIIF S2 es específico para divulgaciones relacionadas con el clima.', 2, true),
('11111111-1111-1111-1111-111111111111', '¿Cuándo entran en vigor estos estándares?', 'Depende de la jurisdicción. Muchos países están adoptándolos para períodos fiscales que inician en 2024-2025. Consulta con tu regulador local para fechas específicas.', 3, true),

-- Diagnóstico
('22222222-2222-2222-2222-222222222222', '¿Cómo empiezo mi diagnóstico NIIF?', 'Comienza con nuestra guía de diagnóstico en Fase 1. Esta te ayudará a evaluar el estado actual de tu organización, identificar brechas y crear un plan de acción.', 1, true),
('22222222-2222-2222-2222-222222222222', '¿Cuánto tiempo toma completar el diagnóstico?', 'Típicamente toma entre 2-4 semanas dependiendo del tamaño de tu organización y la disponibilidad de información. Nuestra plataforma te guía paso a paso.', 2, true),

-- Materialidad
('33333333-3333-3333-3333-333333333333', '¿Qué es el análisis de materialidad doble?', 'Es el proceso de identificar temas ESG que son materiales tanto desde la perspectiva de impacto (cómo tu empresa afecta al ambiente/sociedad) como desde la perspectiva financiera (cómo estos temas afectan tu negocio).', 1, true),
('33333333-3333-3333-3333-333333333333', '¿Debo consultar a mis stakeholders?', 'Sí, el engagement con stakeholders es fundamental para identificar correctamente los temas materiales. Nuestra guía incluye metodologías de consulta.', 2, true),

-- Medición y Reporte
('44444444-4444-4444-4444-444444444444', '¿Cómo calculo mi huella de carbono?', 'Utiliza nuestra guía de cálculo de huella de carbono en Fase 4. Incluye metodología para Scope 1, 2 y 3, y nuestra calculadora interactiva te ayuda con los cálculos.', 1, true),
('44444444-4444-4444-4444-444444444444', '¿Dónde encuentro factores de emisión actualizados?', 'Tenemos una base de datos de factores de emisión 2024 en la biblioteca de recursos. También puedes consultar bases de datos como IPCC, GHG Protocol, o factores locales de tu país.', 2, true),

-- Técnico
('55555555-5555-5555-5555-555555555555', '¿Cómo subo un documento?', 'En la sección de recursos, los administradores pueden subir archivos de hasta 50MB usando drag & drop o el botón de selección. Los formatos soportados incluyen PDF, imágenes, y documentos Office.', 1, true),
('55555555-5555-5555-5555-555555555555', '¿Puedo descargar mi progreso?', 'Sí, en la sección Mi Progreso encontrarás la opción de exportar tu avance. También puedes descargar recursos individuales desde la biblioteca.', 2, true),

-- Suscripción
('66666666-6666-6666-6666-666666666666', '¿Qué incluye el plan gratuito?', 'El plan gratuito incluye acceso a recursos de Fase 1 (Diagnóstico), recursos generales, y seguimiento básico de progreso. Ideal para comenzar tu viaje hacia NIIF.', 1, true),
('66666666-6666-6666-6666-666666666666', '¿Cómo actualizo mi plan?', 'Contacta con nuestro equipo de ventas desde la sección de soporte o mediante el formulario de contacto. Te ayudaremos a elegir el plan que mejor se adapte a tus necesidades.', 2, true)
ON CONFLICT DO NOTHING;

-- ====================================
-- FUNCIONES ÚTILES
-- ====================================

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION marcar_notificacion_leida(notif_id UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notificaciones
    SET leida = TRUE, leida_at = NOW()
    WHERE id = notif_id AND user_id = user_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para crear notificación
CREATE OR REPLACE FUNCTION crear_notificacion(
    user_id_param UUID,
    tipo_param VARCHAR,
    titulo_param TEXT,
    mensaje_param TEXT,
    link_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    nueva_notif_id UUID;
BEGIN
    INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, link)
    VALUES (user_id_param, tipo_param, titulo_param, mensaje_param, link_param)
    RETURNING id INTO nueva_notif_id;
    
    RETURN nueva_notif_id;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones para usuarios';
COMMENT ON TABLE public.faq_categorias IS 'Categorías para organizar FAQs';
COMMENT ON TABLE public.faqs IS 'Preguntas frecuentes del sistema';
COMMENT ON TABLE public.tickets_soporte IS 'Tickets de soporte técnico';
COMMENT ON TABLE public.tickets_mensajes IS 'Mensajes/respuestas en tickets de soporte';
