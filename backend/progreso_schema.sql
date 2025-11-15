-- ============================================
-- CLARISA - PROGRESS TRACKING SCHEMA
-- Sistema de tracking de progreso S1/S2
-- ============================================

-- Tabla: progreso_usuario
-- Tracking del progreso de implementación S1/S2 por usuario
CREATE TABLE IF NOT EXISTS public.progreso_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Progreso general
    porcentaje_total INTEGER DEFAULT 0 CHECK (porcentaje_total BETWEEN 0 AND 100),
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Estado por fase (5 fases principales)
    fase1_diagnostico_completado BOOLEAN DEFAULT FALSE,
    fase1_porcentaje INTEGER DEFAULT 0 CHECK (fase1_porcentaje BETWEEN 0 AND 100),
    fase1_fecha_completado TIMESTAMP WITH TIME ZONE,
    
    fase2_materialidad_completado BOOLEAN DEFAULT FALSE,
    fase2_porcentaje INTEGER DEFAULT 0 CHECK (fase2_porcentaje BETWEEN 0 AND 100),
    fase2_fecha_completado TIMESTAMP WITH TIME ZONE,
    
    fase3_riesgos_completado BOOLEAN DEFAULT FALSE,
    fase3_porcentaje INTEGER DEFAULT 0 CHECK (fase3_porcentaje BETWEEN 0 AND 100),
    fase3_fecha_completado TIMESTAMP WITH TIME ZONE,
    
    fase4_medicion_completado BOOLEAN DEFAULT FALSE,
    fase4_porcentaje INTEGER DEFAULT 0 CHECK (fase4_porcentaje BETWEEN 0 AND 100),
    fase4_fecha_completado TIMESTAMP WITH TIME ZONE,
    
    fase5_reporte_completado BOOLEAN DEFAULT FALSE,
    fase5_porcentaje INTEGER DEFAULT 0 CHECK (fase5_porcentaje BETWEEN 0 AND 100),
    fase5_fecha_completado TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Solo un registro por usuario
    UNIQUE(user_id)
);

-- Tabla: acciones_progreso
-- Registro de acciones que contribuyen al progreso
CREATE TABLE IF NOT EXISTS public.acciones_progreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Información de la acción
    tipo_accion TEXT NOT NULL CHECK (tipo_accion IN (
        'diagnostico_completado',
        'recurso_consultado',
        'herramienta_usada',
        'tarea_completada',
        'documento_subido',
        'curso_completado'
    )),
    fase INTEGER NOT NULL CHECK (fase BETWEEN 1 AND 5),
    descripcion TEXT,
    puntos INTEGER DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progreso_usuario_user_id ON public.progreso_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_acciones_progreso_user_id ON public.acciones_progreso(user_id);
CREATE INDEX IF NOT EXISTS idx_acciones_progreso_fase ON public.acciones_progreso(fase);

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_progreso_usuario_updated_at ON public.progreso_usuario;
CREATE TRIGGER update_progreso_usuario_updated_at
    BEFORE UPDATE ON public.progreso_usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Función: Inicializar progreso para nuevo usuario
-- ============================================
CREATE OR REPLACE FUNCTION inicializar_progreso_usuario(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_progreso_id UUID;
BEGIN
    INSERT INTO public.progreso_usuario (
        user_id,
        porcentaje_total
    ) VALUES (
        p_user_id,
        0
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_progreso_id;
    
    RETURN v_progreso_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Función: Registrar acción y actualizar progreso
-- ============================================
CREATE OR REPLACE FUNCTION registrar_accion_progreso(
    p_user_id UUID,
    p_tipo_accion TEXT,
    p_fase INTEGER,
    p_descripcion TEXT,
    p_puntos INTEGER DEFAULT 10
)
RETURNS VOID AS $$
DECLARE
    v_total_puntos INTEGER;
    v_porcentaje_fase INTEGER;
    v_fase_completada BOOLEAN;
BEGIN
    -- Registrar la acción
    INSERT INTO public.acciones_progreso (
        user_id,
        tipo_accion,
        fase,
        descripcion,
        puntos
    ) VALUES (
        p_user_id,
        p_tipo_accion,
        p_fase,
        p_descripcion,
        p_puntos
    );
    
    -- Calcular puntos totales de la fase
    SELECT COALESCE(SUM(puntos), 0) 
    INTO v_total_puntos
    FROM public.acciones_progreso
    WHERE user_id = p_user_id AND fase = p_fase;
    
    -- Calcular porcentaje de la fase (cada fase requiere 100 puntos)
    v_porcentaje_fase := LEAST(v_total_puntos, 100);
    v_fase_completada := v_porcentaje_fase >= 100;
    
    -- Actualizar progreso de la fase correspondiente
    CASE p_fase
        WHEN 1 THEN
            UPDATE public.progreso_usuario SET
                fase1_porcentaje = v_porcentaje_fase,
                fase1_completado = v_fase_completada,
                fase1_fecha_completado = CASE WHEN v_fase_completada AND fase1_fecha_completado IS NULL THEN NOW() ELSE fase1_fecha_completado END
            WHERE user_id = p_user_id;
        WHEN 2 THEN
            UPDATE public.progreso_usuario SET
                fase2_porcentaje = v_porcentaje_fase,
                fase2_completado = v_fase_completada,
                fase2_fecha_completado = CASE WHEN v_fase_completada AND fase2_fecha_completado IS NULL THEN NOW() ELSE fase2_fecha_completado END
            WHERE user_id = p_user_id;
        WHEN 3 THEN
            UPDATE public.progreso_usuario SET
                fase3_porcentaje = v_porcentaje_fase,
                fase3_completado = v_fase_completada,
                fase3_fecha_completado = CASE WHEN v_fase_completada AND fase3_fecha_completado IS NULL THEN NOW() ELSE fase3_fecha_completado END
            WHERE user_id = p_user_id;
        WHEN 4 THEN
            UPDATE public.progreso_usuario SET
                fase4_porcentaje = v_porcentaje_fase,
                fase4_completado = v_fase_completada,
                fase4_fecha_completado = CASE WHEN v_fase_completada AND fase4_fecha_completado IS NULL THEN NOW() ELSE fase4_fecha_completado END
            WHERE user_id = p_user_id;
        WHEN 5 THEN
            UPDATE public.progreso_usuario SET
                fase5_porcentaje = v_porcentaje_fase,
                fase5_completado = v_fase_completada,
                fase5_fecha_completado = CASE WHEN v_fase_completada AND fase5_fecha_completado IS NULL THEN NOW() ELSE fase5_fecha_completado END
            WHERE user_id = p_user_id;
    END CASE;
    
    -- Actualizar porcentaje total
    UPDATE public.progreso_usuario SET
        porcentaje_total = (
            COALESCE(fase1_porcentaje, 0) +
            COALESCE(fase2_porcentaje, 0) +
            COALESCE(fase3_porcentaje, 0) +
            COALESCE(fase4_porcentaje, 0) +
            COALESCE(fase5_porcentaje, 0)
        ) / 5
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE public.progreso_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acciones_progreso ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios pueden ver solo su propio progreso
DROP POLICY IF EXISTS "Users can view own progress" ON public.progreso_usuario;
CREATE POLICY "Users can view own progress"
    ON public.progreso_usuario
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own progress" ON public.progreso_usuario;
CREATE POLICY "Users can update own progress"
    ON public.progreso_usuario
    FOR UPDATE
    USING (user_id = auth.uid());

-- Policy: Usuarios pueden ver solo sus propias acciones
DROP POLICY IF EXISTS "Users can view own actions" ON public.acciones_progreso;
CREATE POLICY "Users can view own actions"
    ON public.acciones_progreso
    FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON TABLE public.progreso_usuario IS 'Tracking del progreso de implementación NIIF S1/S2 por usuario';
COMMENT ON TABLE public.acciones_progreso IS 'Registro de acciones que contribuyen al progreso del usuario';
COMMENT ON FUNCTION registrar_accion_progreso IS 'Registra una acción y actualiza automáticamente el progreso del usuario';
