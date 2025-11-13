-- ============================================
-- CLARISA - SALES MODULE SCHEMA
-- Módulo de Ventas con Pipeline y Seguimiento
-- ============================================

-- Tabla: oportunidades
-- Gestión de oportunidades de venta generadas desde diagnósticos
CREATE TABLE IF NOT EXISTS public.oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    diagnostico_id UUID REFERENCES public.diagnosticos(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Información del cliente
    nombre_cliente TEXT NOT NULL,
    email_cliente TEXT NOT NULL,
    organizacion TEXT,
    
    -- Clasificación NIIF y Priorización
    arquetipo_niif TEXT NOT NULL, -- Código del arquetipo (ej: UH-MN-CB)
    prioridad TEXT NOT NULL CHECK (prioridad IN ('A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3')),
    
    -- Scoring del diagnóstico
    scoring_urgencia INTEGER NOT NULL CHECK (scoring_urgencia BETWEEN 0 AND 100),
    scoring_madurez INTEGER NOT NULL CHECK (scoring_madurez BETWEEN 0 AND 100),
    scoring_capacidad INTEGER NOT NULL CHECK (scoring_capacidad BETWEEN 0 AND 100),
    scoring_total INTEGER NOT NULL CHECK (scoring_total BETWEEN 0 AND 100),
    
    -- Pipeline y estado
    etapa_pipeline TEXT NOT NULL DEFAULT 'nuevo_lead' CHECK (etapa_pipeline IN (
        'nuevo_lead',
        'calificado',
        'contacto_inicial',
        'diagnostico_profundo',
        'consultoria_activa',
        'preparando_solucion',
        'negociacion',
        'cerrado_ganado',
        'cerrado_perdido',
        'en_nutricion'
    )),
    
    -- Información comercial
    valor_estimado_usd DECIMAL(10, 2) DEFAULT 0,
    probabilidad_cierre INTEGER DEFAULT 10 CHECK (probabilidad_cierre BETWEEN 0 AND 100),
    
    -- Seguimiento
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_estimada_cierre DATE,
    ultima_actividad TIMESTAMP WITH TIME ZONE,
    proxima_accion TEXT,
    notas TEXT,
    
    -- Estado general
    estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'ganado', 'perdido', 'nutricion')),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para oportunidades
CREATE INDEX IF NOT EXISTS idx_oportunidades_user_id ON public.oportunidades(user_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_diagnostico_id ON public.oportunidades(diagnostico_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_prioridad ON public.oportunidades(prioridad);
CREATE INDEX IF NOT EXISTS idx_oportunidades_etapa_pipeline ON public.oportunidades(etapa_pipeline);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estado ON public.oportunidades(estado);
CREATE INDEX IF NOT EXISTS idx_oportunidades_fecha_creacion ON public.oportunidades(fecha_creacion DESC);

-- ============================================
-- Tabla: actividades
-- Seguimiento y tareas relacionadas a oportunidades
-- ============================================
CREATE TABLE IF NOT EXISTS public.actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    oportunidad_id UUID REFERENCES public.oportunidades(id) ON DELETE CASCADE,
    creado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Información de la actividad
    tipo TEXT NOT NULL CHECK (tipo IN ('llamada', 'email', 'reunion', 'tarea', 'nota', 'whatsapp')),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    
    -- Programación
    fecha_programada TIMESTAMP WITH TIME ZONE,
    fecha_completada TIMESTAMP WITH TIME ZONE,
    completada BOOLEAN DEFAULT FALSE,
    
    -- Resultado
    resultado TEXT, -- ej: "Cliente interesado, agendar reunión"
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para actividades
CREATE INDEX IF NOT EXISTS idx_actividades_oportunidad_id ON public.actividades(oportunidad_id);
CREATE INDEX IF NOT EXISTS idx_actividades_creado_por ON public.actividades(creado_por);
CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON public.actividades(tipo);
CREATE INDEX IF NOT EXISTS idx_actividades_completada ON public.actividades(completada);
CREATE INDEX IF NOT EXISTS idx_actividades_fecha_programada ON public.actividades(fecha_programada);

-- ============================================
-- Función: actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_oportunidades_updated_at ON public.oportunidades;
CREATE TRIGGER update_oportunidades_updated_at
    BEFORE UPDATE ON public.oportunidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_actividades_updated_at ON public.actividades;
CREATE TRIGGER update_actividades_updated_at
    BEFORE UPDATE ON public.actividades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Función: calcular prioridad automática
-- Basado en scoring de diagnóstico
-- ============================================
CREATE OR REPLACE FUNCTION calcular_prioridad(
    p_urgencia INTEGER,
    p_madurez INTEGER,
    p_capacidad INTEGER
)
RETURNS TEXT AS $$
DECLARE
    nivel_urgencia TEXT;
    nivel_madurez TEXT;
    nivel_capacidad TEXT;
BEGIN
    -- Clasificar Urgencia
    IF p_urgencia >= 67 THEN
        nivel_urgencia := 'U';
    ELSIF p_urgencia >= 34 THEN
        nivel_urgencia := 'M';
    ELSE
        nivel_urgencia := 'B';
    END IF;
    
    -- Clasificar Madurez
    IF p_madurez >= 67 THEN
        nivel_madurez := 'H';
    ELSIF p_madurez >= 34 THEN
        nivel_madurez := 'M';
    ELSE
        nivel_madurez := 'L';
    END IF;
    
    -- Clasificar Capacidad
    IF p_capacidad >= 67 THEN
        nivel_capacidad := 'H';
    ELSIF p_capacidad >= 34 THEN
        nivel_capacidad := 'M';
    ELSE
        nivel_capacidad := 'L';
    END IF;
    
    -- Determinar prioridad según matriz
    -- A = Alta prioridad (Urgente + Alta madurez/capacidad)
    IF nivel_urgencia = 'U' AND (nivel_madurez = 'H' OR nivel_capacidad = 'H') THEN
        IF nivel_madurez = 'H' AND nivel_capacidad = 'H' THEN
            RETURN 'A1';
        ELSIF nivel_madurez = 'H' OR nivel_capacidad = 'H' THEN
            RETURN 'A2';
        ELSE
            RETURN 'A3';
        END IF;
    
    -- B = Prioridad media
    ELSIF nivel_urgencia = 'M' OR (nivel_madurez = 'M' AND nivel_capacidad = 'M') THEN
        IF nivel_urgencia = 'M' AND nivel_madurez = 'M' AND nivel_capacidad = 'M' THEN
            RETURN 'B1';
        ELSIF nivel_urgencia = 'M' THEN
            RETURN 'B2';
        ELSE
            RETURN 'B3';
        END IF;
    
    -- C = Prioridad baja (nutrición)
    ELSE
        IF nivel_urgencia = 'B' AND nivel_madurez = 'L' THEN
            RETURN 'C3';
        ELSIF nivel_madurez = 'L' OR nivel_capacidad = 'L' THEN
            RETURN 'C2';
        ELSE
            RETURN 'C1';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Row Level Security (RLS)
-- Solo admins pueden acceder al módulo de ventas
-- ============================================
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver y gestionar oportunidades
DROP POLICY IF EXISTS "Admin access to oportunidades" ON public.oportunidades;
CREATE POLICY "Admin access to oportunidades"
    ON public.oportunidades
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.rol = 'admin'
        )
    );

-- Policy: Solo admins pueden ver y gestionar actividades
DROP POLICY IF EXISTS "Admin access to actividades" ON public.actividades;
CREATE POLICY "Admin access to actividades"
    ON public.actividades
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.rol = 'admin'
        )
    );

-- ============================================
-- Comentarios para documentación
-- ============================================
COMMENT ON TABLE public.oportunidades IS 'Oportunidades de venta generadas automáticamente desde diagnósticos NIIF';
COMMENT ON TABLE public.actividades IS 'Actividades y tareas de seguimiento para cada oportunidad';
COMMENT ON FUNCTION calcular_prioridad IS 'Calcula la prioridad (A1-C3) basada en scoring de urgencia, madurez y capacidad';
