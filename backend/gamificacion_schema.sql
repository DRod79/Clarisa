-- Tabla para recursos favoritos
CREATE TABLE IF NOT EXISTS recursos_favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    recurso_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recurso_id)
);

-- Índices para recursos_favoritos
CREATE INDEX IF NOT EXISTS idx_recursos_favoritos_user ON recursos_favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_recursos_favoritos_recurso ON recursos_favoritos(recurso_id);

-- Tabla para logros de usuarios
CREATE TABLE IF NOT EXISTS user_logros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    logro_codigo VARCHAR(100) NOT NULL,
    obtenido_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, logro_codigo)
);

-- Índices para user_logros
CREATE INDEX IF NOT EXISTS idx_user_logros_user ON user_logros(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logros_codigo ON user_logros(logro_codigo);

-- Comentarios
COMMENT ON TABLE recursos_favoritos IS 'Almacena los recursos marcados como favoritos por los usuarios';
COMMENT ON TABLE user_logros IS 'Almacena los logros/badges obtenidos por los usuarios';
