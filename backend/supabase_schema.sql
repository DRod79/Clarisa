-- =============================================
-- CLARISA - SUPABASE DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'cliente_pagado', 'cliente_gratuito', 'lead')),
  organizacion TEXT,
  pais TEXT,
  departamento TEXT,
  puesto TEXT,
  telefono TEXT,
  pais_telefono TEXT,
  anios_experiencia TEXT,
  avatar_url TEXT,
  suscripcion_activa BOOLEAN DEFAULT false,
  plan_actual TEXT CHECK (plan_actual IN ('gratuito', 'basico', 'pro', 'enterprise')),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_acceso TIMESTAMP,
  onboarding_completado BOOLEAN DEFAULT false,
  progreso_general INTEGER DEFAULT 0 CHECK (progreso_general >= 0 AND progreso_general <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. DIAGNÓSTICOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS diagnosticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Respuestas del diagnóstico
  respuestas JSONB NOT NULL,
  
  -- Scoring
  scoring JSONB NOT NULL,
  arquetipo TEXT NOT NULL,
  urgencia_puntos INTEGER,
  madurez_puntos INTEGER,
  capacidad_puntos INTEGER,
  
  -- Metadata
  fecha_completado TIMESTAMP DEFAULT NOW(),
  informe_enviado BOOLEAN DEFAULT false,
  fecha_informe_enviado TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_diagnosticos_user_id ON diagnosticos(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_arquetipo ON diagnosticos(arquetipo);

-- =============================================
-- 3. SUSCRIPCIONES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS suscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basico', 'pro', 'enterprise')),
  precio_mensual DECIMAL(10,2),
  moneda TEXT DEFAULT 'USD',
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,
  estado TEXT CHECK (estado IN ('activa', 'cancelada', 'pausada', 'vencida')) DEFAULT 'activa',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  auto_renovar BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id ON suscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);

-- =============================================
-- 4. PAGOS TABLE (Mock initial)
-- =============================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE SET NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda TEXT DEFAULT 'USD',
  metodo_pago TEXT,
  estado TEXT CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')) DEFAULT 'pendiente',
  stripe_payment_id TEXT,
  fecha_pago TIMESTAMP DEFAULT NOW(),
  factura_url TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_user_id ON pagos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);

-- =============================================
-- 5. CONTENIDO TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS contenido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT CHECK (tipo IN ('plantilla', 'guia', 'curso', 'articulo', 'video', 'herramienta')) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  contenido JSONB,
  archivo_url TEXT,
  thumbnail_url TEXT,
  categoria TEXT,
  tags TEXT[],
  nivel_acceso TEXT CHECK (nivel_acceso IN ('gratuito', 'basico', 'pro', 'enterprise')) DEFAULT 'gratuito',
  descargas INTEGER DEFAULT 0,
  vistas INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  publicado BOOLEAN DEFAULT false,
  fecha_publicacion TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contenido_tipo ON contenido(tipo);
CREATE INDEX IF NOT EXISTS idx_contenido_nivel_acceso ON contenido(nivel_acceso);
CREATE INDEX IF NOT EXISTS idx_contenido_publicado ON contenido(publicado);

-- =============================================
-- 6. ACTIVIDAD USUARIOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS actividad_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo_actividad TEXT NOT NULL,
  recurso_id UUID,
  recurso_tipo TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actividad_user_id ON actividad_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_actividad_tipo ON actividad_usuarios(tipo_actividad);

-- =============================================
-- 7. TAREAS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')) DEFAULT 'media',
  estado TEXT CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')) DEFAULT 'pendiente',
  fecha_limite TIMESTAMP,
  completada_el TIMESTAMP,
  categoria TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tareas_user_id ON tareas(user_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);

-- =============================================
-- 8. NOTAS CRM TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notas_crm (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('nota', 'llamada', 'email', 'reunion', 'tarea')) DEFAULT 'nota',
  asunto TEXT,
  contenido TEXT,
  fecha_interaccion TIMESTAMP DEFAULT NOW(),
  proxima_accion TEXT,
  fecha_proxima_accion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_user_id ON notas_crm(user_id);

-- =============================================
-- 9. REPORTES GUARDADOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  configuracion JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  compartido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- Allow public insert for new user registration
CREATE POLICY "Allow public user registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- =============================================
-- DIAGNÓSTICOS TABLE POLICIES
-- =============================================

-- Users can view their own diagnosticos
CREATE POLICY "Users can view own diagnosticos"
  ON diagnosticos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own diagnosticos
CREATE POLICY "Users can insert own diagnosticos"
  ON diagnosticos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all diagnosticos
CREATE POLICY "Admins can view all diagnosticos"
  ON diagnosticos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- =============================================
-- SUSCRIPCIONES TABLE POLICIES
-- =============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON suscripciones FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON suscripciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- Admins can manage subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON suscripciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- =============================================
-- CONTENIDO TABLE POLICIES
-- =============================================

-- Everyone can view published content
CREATE POLICY "Anyone can view published content"
  ON contenido FOR SELECT
  USING (publicado = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage content"
  ON contenido FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- =============================================
-- TAREAS TABLE POLICIES
-- =============================================

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON tareas FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own tasks
CREATE POLICY "Users can manage own tasks"
  ON tareas FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- ACTIVIDAD USUARIOS TABLE POLICIES
-- =============================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON actividad_usuarios FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert activity (service role)
CREATE POLICY "System can insert activity"
  ON actividad_usuarios FOR INSERT
  WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON actividad_usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.rol = 'admin'
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contenido_updated_at BEFORE UPDATE ON contenido
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA - Create first admin user
-- =============================================

-- Note: This will be executed manually after the first user signs up
-- We'll convert them to admin via SQL or Supabase dashboard
