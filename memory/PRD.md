# Clarisa — PRD / Estado

## Problema original
Plataforma educativa para organizaciones latinoamericanas que implementan estándares de
sostenibilidad NIIF S1/S2. Roles: `admin` y `cliente_gratuito`.
Módulos cliente: Mi Progreso, Recursos, Hoja de Ruta (antes Roadmap), Ayuda, Soporte.
Módulos admin: CRM/Ventas, Estadísticas, Usuarios, Reportes Avanzados, Diagnósticos.
Objetivo clave: 100% disponibilidad para demos/presentaciones.

## Arquitectura
- Frontend: React + Tailwind
- Backend: FastAPI
- DB de diseño: Supabase (PostgreSQL via REST) — el sandbox de Emergent NO resuelve DNS a Supabase
- DB usada para lo crítico: MongoDB nativo (diagnósticos)

## Estado actual (Junio 2026)
- **MODO PRESENTACIÓN / MOCK ACTIVO**: login mock vía `backend/auth_fallback.py`.
  Cuentas: admin@clarisa.com / TodoEsProbar2026* ; cliente@clarisa.com / TodoEsCuestion2026*.
- **Diagnóstico**: se guarda en MongoDB (`POST /api/diagnostico`, lista `GET /api/diagnosticos`).
  Formulario inicia SIEMPRE limpio (sin precargar datos del usuario anterior).
- **Preguntas**: P2 sin texto de ingresos; P13 con 3 opciones; P20 eliminada.
- **Arquetipos (9)**: textos nuevos del cliente aplicados en `utils/scoring.js`.
- **Pantalla de resultados**: bloques "48 horas" y "descarga recursos" OCULTOS (comentados);
  reemplazados por "Hoja de Ruta personalizada" (5 fases, adaptada por madurez/urgencia/capacidad)
  + botón "Crear cuenta para guardar mi Hoja de Ruta" (informativa, sin botones que requieran login).
- **Renombrado**: "Roadmap" → "Hoja de Ruta" en menú cliente y título de página.
- **Admin → Diagnósticos**: lista de leads con detalle y exportación CSV/Word/PDF (lista + reporte individual).
- **Landing hero**: sin imagen, fondo decorativo centrado en el texto.
- Fuente única de fases: `utils/fases.js` (usada por RoadmapPage y por la Hoja de Ruta del diagnóstico).

## Backlog / Próximos pasos
- (Pre-existente) `GET /api/progreso/{user_id}` da 404 con cliente mock → toast "Error al cargar progreso"
  al entrar a Hoja de Ruta. Sugerido: tratar 404 como estado inicial sin error.
- (Opcional) Envío automático de correo al usuario tras el diagnóstico (Resend/SendGrid).
- (Opcional) Crear cuenta automática al finalizar el diagnóstico.
- (Diferido) Restaurar Supabase o migrar más módulos a MongoDB.
- (Diferido) Refactor de `server.py` en routers.

## Archivos clave
- `frontend/src/components/diagnostico/FormWizard.jsx` (envío a backend, limpieza, sin P20)
- `frontend/src/components/diagnostico/ConfirmationPage.jsx` (Hoja de Ruta personalizada)
- `frontend/src/utils/scoring.js` (arquetipos + generarHojaDeRuta)
- `frontend/src/utils/fases.js` (5 fases)
- `frontend/src/pages/admin/DiagnosticosAdminPage.jsx` (lista + export CSV/Word/PDF)
- `frontend/src/pages/app/RoadmapPage.jsx`, `frontend/src/layouts/ClientLayout.jsx` (renombrado)
- `backend/server.py` (POST/GET diagnostico, MongoDB), `backend/auth_fallback.py` (login mock)
