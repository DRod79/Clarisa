# Clarisa — PRD / Estado

## Problema original
Plataforma educativa para organizaciones latinoamericanas que implementan estándares de
sostenibilidad NIIF S1/S2. Roles: `admin` y `cliente_gratuito`.
Módulos cliente: Mi Progreso, Recursos, Roadmap, Ayuda, Soporte.
Módulos admin: CRM, Estadísticas, Usuarios, Reportes Avanzados.
Objetivo clave del usuario: 100% disponibilidad para demos/presentaciones.

## Arquitectura
- Frontend: React + Tailwind
- Backend: FastAPI
- DB (diseño): Supabase (PostgreSQL via REST API)
- Entorno: Emergent sandbox (Kubernetes) — **NO resuelve DNS externo a Supabase**

## Estado actual (Junio 2026)
- **MODO PRESENTACIÓN / MOCK ACTIVO**: `backend/auth_fallback.py` provee login mock
  porque el DNS a `*.supabase.co` falla (`[Errno -2]`). Decisión del usuario: NO tocar
  arquitectura por ahora, solo dejar la app estable para demo.
- Credenciales mock activas (ver `/app/memory/test_credentials.md`):
  - admin@clarisa.com / TodoEsProbar2026*
  - cliente@test.com / TodoEsCuestion2026*
- Login verificado (200 OK nuevas, 401 viejas). Landing renderiza correctamente.

## Backlog / Próximos pasos
- **P0**: Restaurar conectividad real a Supabase (bloqueado por infra DNS del sandbox) y
  revertir `auth_fallback.py` cuando DNS funcione. Alternativa: migrar a MongoDB nativo.
- **P1**: Integraciones de terceros (correo para tickets de soporte, Stripe) — pospuesto.

## Archivos clave
- `backend/auth_fallback.py` — login mock (temporal)
- `backend/auth.py` — enruta a fallback ante fallo de Supabase
- `frontend/src/pages/app/RecursosPage.jsx` — filtro "Mis Favoritos"
- `/app/AUDITORIA_SEGURIDAD_CLARISA.md`, `/app/DIAGNOSTICO_COMPLETO_PREGUNTAS_SCORING.csv`
