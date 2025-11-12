-- =============================================
-- DESACTIVAR RLS COMPLETAMENTE
-- =============================================

-- Verificar estado actual de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'diagnosticos', 'suscripciones', 'pagos', 'contenido', 'actividad_usuarios', 'tareas', 'notas_crm', 'reportes');

-- Desactivar RLS en todas las tablas
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnosticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suscripciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contenido DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.actividad_usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tareas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notas_crm DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reportes DISABLE ROW LEVEL SECURITY;

-- Verificar que se desactivó correctamente
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'diagnosticos', 'suscripciones', 'pagos', 'contenido', 'actividad_usuarios', 'tareas', 'notas_crm', 'reportes');
