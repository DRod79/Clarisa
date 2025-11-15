-- ============================================
-- CLARISA - RECURSOS SCHEMA
-- Biblioteca de contenido con permisos
-- ============================================

-- Tabla: recursos
-- Contenido educativo y herramientas
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información básica
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('guia', 'template', 'video', 'articulo', 'herramienta', 'caso_estudio')),
    categoria TEXT NOT NULL CHECK (categoria IN ('diagnostico', 'materialidad', 'riesgos', 'medicion', 'reporte', 'general')),
    
    -- Contenido
    contenido TEXT, -- Para artículos/guías
    url_externo TEXT, -- Para videos externos
    archivo_url TEXT, -- Para archivos descargables
    
    -- Metadatos
    autor TEXT,
    duracion_minutos INTEGER, -- Para videos
    nivel_dificultad TEXT CHECK (nivel_dificultad IN ('basico', 'intermedio', 'avanzado')),
    tags TEXT[], -- Array de tags para búsqueda
    
    -- Permisos y acceso
    acceso_requerido TEXT NOT NULL DEFAULT 'gratuito' CHECK (acceso_requerido IN ('gratuito', 'pagado', 'todos')),
    fase_relacionada INTEGER CHECK (fase_relacionada BETWEEN 1 AND 5),
    
    -- Métricas
    vistas INTEGER DEFAULT 0,
    descargas INTEGER DEFAULT 0,
    
    -- Estado
    publicado BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: recursos_usuario
-- Tracking de interacción usuario-recurso
CREATE TABLE IF NOT EXISTS public.recursos_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recurso_id UUID REFERENCES public.recursos(id) ON DELETE CASCADE,
    
    -- Interacción
    visto BOOLEAN DEFAULT FALSE,
    fecha_visto TIMESTAMP WITH TIME ZONE,
    descargado BOOLEAN DEFAULT FALSE,
    fecha_descargado TIMESTAMP WITH TIME ZONE,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    
    -- Calificación (opcional)
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Solo una interacción por usuario-recurso
    UNIQUE(user_id, recurso_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON public.recursos(tipo);
CREATE INDEX IF NOT EXISTS idx_recursos_categoria ON public.recursos(categoria);
CREATE INDEX IF NOT EXISTS idx_recursos_acceso ON public.recursos(acceso_requerido);
CREATE INDEX IF NOT EXISTS idx_recursos_fase ON public.recursos(fase_relacionada);
CREATE INDEX IF NOT EXISTS idx_recursos_publicado ON public.recursos(publicado);
CREATE INDEX IF NOT EXISTS idx_recursos_destacado ON public.recursos(destacado);

CREATE INDEX IF NOT EXISTS idx_recursos_usuario_user_id ON public.recursos_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_recursos_usuario_recurso_id ON public.recursos_usuario(recurso_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_recursos_updated_at ON public.recursos;
CREATE TRIGGER update_recursos_updated_at
    BEFORE UPDATE ON public.recursos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recursos_usuario_updated_at ON public.recursos_usuario;
CREATE TRIGGER update_recursos_usuario_updated_at
    BEFORE UPDATE ON public.recursos_usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Función: Registrar vista de recurso
-- ============================================
CREATE OR REPLACE FUNCTION registrar_vista_recurso(
    p_user_id UUID,
    p_recurso_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insertar o actualizar interacción
    INSERT INTO public.recursos_usuario (
        user_id,
        recurso_id,
        visto,
        fecha_visto
    ) VALUES (
        p_user_id,
        p_recurso_id,
        TRUE,
        NOW()
    )
    ON CONFLICT (user_id, recurso_id) 
    DO UPDATE SET
        visto = TRUE,
        fecha_visto = NOW();
    
    -- Incrementar contador de vistas
    UPDATE public.recursos
    SET vistas = vistas + 1
    WHERE id = p_recurso_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Función: Registrar descarga de recurso
-- ============================================
CREATE OR REPLACE FUNCTION registrar_descarga_recurso(
    p_user_id UUID,
    p_recurso_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Insertar o actualizar interacción
    INSERT INTO public.recursos_usuario (
        user_id,
        recurso_id,
        descargado,
        fecha_descargado
    ) VALUES (
        p_user_id,
        p_recurso_id,
        TRUE,
        NOW()
    )
    ON CONFLICT (user_id, recurso_id) 
    DO UPDATE SET
        descargado = TRUE,
        fecha_descargado = NOW();
    
    -- Incrementar contador de descargas
    UPDATE public.recursos
    SET descargas = descargas + 1
    WHERE id = p_recurso_id;
    
    -- Registrar acción de progreso (si aplica)
    -- Si el recurso está relacionado con una fase
    DECLARE
        v_fase INTEGER;
    BEGIN
        SELECT fase_relacionada INTO v_fase
        FROM public.recursos
        WHERE id = p_recurso_id AND fase_relacionada IS NOT NULL;
        
        IF v_fase IS NOT NULL THEN
            PERFORM registrar_accion_progreso(
                p_user_id,
                'recurso_consultado',
                v_fase,
                'Descargó recurso',
                5
            );
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_usuario ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden ver recursos publicados según su nivel de acceso
DROP POLICY IF EXISTS "Users can view published recursos" ON public.recursos;
CREATE POLICY "Users can view published recursos"
    ON public.recursos
    FOR SELECT
    USING (
        publicado = TRUE AND (
            acceso_requerido = 'todos' OR
            acceso_requerido = 'gratuito' OR
            (acceso_requerido = 'pagado' AND EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.rol IN ('cliente_pagado', 'admin')
            ))
        )
    );

-- Policy: Admins pueden gestionar recursos
DROP POLICY IF EXISTS "Admins can manage recursos" ON public.recursos;
CREATE POLICY "Admins can manage recursos"
    ON public.recursos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.rol = 'admin'
        )
    );

-- Policy: Usuarios pueden ver sus propias interacciones
DROP POLICY IF EXISTS "Users can view own interactions" ON public.recursos_usuario;
CREATE POLICY "Users can view own interactions"
    ON public.recursos_usuario
    FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- Datos de ejemplo
-- ============================================
INSERT INTO public.recursos (titulo, descripcion, tipo, categoria, contenido, acceso_requerido, fase_relacionada, nivel_dificultad, tags, publicado, destacado) VALUES
-- Fase 1: Diagnóstico
('Guía de Diagnóstico NIIF S1/S2', 'Guía completa para realizar tu diagnóstico inicial de preparación para NIIF S1 y S2', 'guia', 'diagnostico', 'Contenido de ejemplo de la guía...', 'gratuito', 1, 'basico', ARRAY['diagnostico', 'niif', 's1', 's2'], TRUE, TRUE),
('Template de Autoevaluación', 'Plantilla Excel para evaluar el nivel de preparación de tu organización', 'template', 'diagnostico', NULL, 'gratuito', 1, 'basico', ARRAY['template', 'excel', 'autoevaluacion'], TRUE, FALSE),
('Video: Introducción a NIIF S1/S2', 'Video explicativo sobre los estándares NIIF S1 y S2', 'video', 'diagnostico', NULL, 'gratuito', 1, 'basico', ARRAY['video', 'introduccion', 'niif'], TRUE, TRUE),

-- Fase 2: Materialidad
('Guía de Análisis de Materialidad', 'Metodología para identificar temas ESG materiales', 'guia', 'materialidad', 'Contenido de ejemplo...', 'pagado', 2, 'intermedio', ARRAY['materialidad', 'esg', 'stakeholders'], TRUE, TRUE),
('Matriz de Materialidad - Template', 'Plantilla para crear tu matriz de materialidad', 'template', 'materialidad', NULL, 'pagado', 2, 'intermedio', ARRAY['matriz', 'template', 'materialidad'], TRUE, FALSE),
('Caso de Estudio: Análisis de Materialidad en Retail', 'Ejemplo real de cómo una empresa retail realizó su análisis', 'caso_estudio', 'materialidad', 'Contenido de ejemplo...', 'pagado', 2, 'intermedio', ARRAY['caso', 'retail', 'ejemplo'], TRUE, FALSE),

-- Fase 3: Riesgos
('Guía de Identificación de Riesgos Climáticos', 'Cómo identificar riesgos físicos y de transición', 'guia', 'riesgos', 'Contenido de ejemplo...', 'pagado', 3, 'avanzado', ARRAY['riesgos', 'climaticos', 'tcfd'], TRUE, TRUE),
('Template de Matriz de Riesgos', 'Plantilla para evaluar y priorizar riesgos climáticos', 'template', 'riesgos', NULL, 'pagado', 3, 'avanzado', ARRAY['riesgos', 'matriz', 'template'], TRUE, FALSE),

-- Fase 4: Medición
('Guía de Cálculo de Huella de Carbono', 'Metodología completa para calcular emisiones Scope 1, 2 y 3', 'guia', 'medicion', 'Contenido de ejemplo...', 'pagado', 4, 'avanzado', ARRAY['huella', 'carbono', 'ghg'], TRUE, TRUE),
('Calculadora de Emisiones GEI', 'Herramienta interactiva para calcular tu huella', 'herramienta', 'medicion', NULL, 'pagado', 4, 'intermedio', ARRAY['calculadora', 'emisiones', 'tool'], TRUE, TRUE),
('Factores de Emisión 2024', 'Base de datos actualizada de factores de emisión', 'articulo', 'medicion', 'Contenido de ejemplo...', 'pagado', 4, 'avanzado', ARRAY['factores', 'emisiones', 'datos'], TRUE, FALSE),

-- Fase 5: Reporte
('Template de Reporte NIIF S1', 'Plantilla completa para tu reporte de sostenibilidad S1', 'template', 'reporte', NULL, 'pagado', 5, 'avanzado', ARRAY['reporte', 's1', 'template'], TRUE, TRUE),
('Template de Reporte NIIF S2', 'Plantilla completa para tu reporte climático S2', 'template', 'reporte', NULL, 'pagado', 5, 'avanzado', ARRAY['reporte', 's2', 'template'], TRUE, TRUE),
('Guía de Divulgación y Comunicación', 'Mejores prácticas para comunicar tu desempeño ESG', 'guia', 'reporte', 'Contenido de ejemplo...', 'pagado', 5, 'intermedio', ARRAY['divulgacion', 'comunicacion', 'esg'], TRUE, FALSE),

-- Recursos Generales
('Glosario de Términos ESG', 'Diccionario completo de términos de sostenibilidad', 'articulo', 'general', 'Contenido de ejemplo...', 'gratuito', NULL, 'basico', ARRAY['glosario', 'terminos', 'esg'], TRUE, FALSE),
('FAQ - Preguntas Frecuentes NIIF S1/S2', 'Respuestas a las preguntas más comunes', 'articulo', 'general', 'Contenido de ejemplo...', 'gratuito', NULL, 'basico', ARRAY['faq', 'preguntas', 'niif'], TRUE, TRUE);

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON TABLE public.recursos IS 'Biblioteca de contenido educativo y herramientas';
COMMENT ON TABLE public.recursos_usuario IS 'Tracking de interacciones usuario-recurso';
COMMENT ON FUNCTION registrar_vista_recurso IS 'Registra que un usuario vio un recurso';
COMMENT ON FUNCTION registrar_descarga_recurso IS 'Registra descarga y actualiza progreso automáticamente';
