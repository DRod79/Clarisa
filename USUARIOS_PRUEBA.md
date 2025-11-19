# 👥 USUARIOS DE PRUEBA - CLARISA

## Usuarios Disponibles y Verificados

### 1. 🔴 **Usuario Admin**
```
Email:    admin@clarisa.com
Password: admin123
Rol:      admin
```

**Permisos:**
- ✅ Acceso completo al panel de administración
- ✅ Gestión de ventas (CRM)
- ✅ Gestión de recursos (CRUD completo)
- ✅ Ver todas las estadísticas
- ✅ Acceso a todas las páginas del módulo cliente (Dashboard, Mi Progreso, Roadmap, Recursos, Ayuda, Soporte)

---

### 2. 🟢 **Usuario Cliente Gratuito**
```
Email:    cliente@test.com
Password: pass123
Rol:      cliente_gratuito
```

**Permisos:**
- ✅ Dashboard de cliente
- ✅ Mi Progreso (visualización de fases)
- ✅ Roadmap personalizado
- ✅ Recursos (con restricciones de contenido pagado bloqueado)
- ✅ Centro de Ayuda (FAQs)
- ✅ Sistema de Soporte (crear y ver tickets)
- ✅ Notificaciones
- ❌ NO tiene acceso al panel de administración

**Estado:** ✅ **ACTIVO Y VERIFICADO** (Contraseña corregida a pass123 el 2025-11-19)

---

## 🧪 Testing Completado

### Backend Testing (9/9 ✅)
- Notificaciones API (stats, listar, marcar leída, marcar todas)
- Ayuda API (FAQs con filtros y búsqueda)
- Soporte API (crear, listar, ver detalles de tickets)

### Frontend Testing (13/13 ✅)
- NotificacionesDropdown (desktop y mobile)
- RoadmapPage (5 fases de implementación)
- AyudaPage (13 FAQs categorizadas)
- SoportePage (sistema completo de tickets)
- Navegación y responsive design

---

## 🔍 Cómo Probar

### Prueba con Usuario Admin:
1. Ir a: https://clarisa-sustain.preview.emergentagent.com/login
2. Ingresar: admin@clarisa.com / admin123
3. Explorar panel de administración y todas las funcionalidades

### Prueba con Usuario Cliente:
1. Ir a: https://clarisa-sustain.preview.emergentagent.com/login
2. Ingresar: cliente@test.com / pass123
3. Explorar módulo de cliente (Dashboard, Roadmap, Ayuda, Soporte)
4. Verificar restricciones de contenido pagado en Recursos
5. Crear un ticket de soporte y verificar notificación

---

## 📊 Datos de Prueba

### Notificaciones
- El usuario admin puede tener notificaciones de sistema
- Al crear un ticket, se genera automáticamente una notificación

### FAQs
- 13 FAQs disponibles en el Centro de Ayuda
- Categorías: Primeros Pasos, Diagnóstico, Materialidad, Medición y Reporte, Técnico, Suscripción

### Recursos
- 16 recursos en la biblioteca
- Organizados en 5 fases
- Tipos: Artículos, Guías, Videos, Plantillas, Webinars
- Control de acceso por rol (gratuito vs pagado)

---

## ⚡ Comandos Útiles

### Verificar usuario en base de datos:
```bash
cd /app/backend && export $(cat .env | grep -E "SUPABASE_URL|SUPABASE_KEY" | xargs) && python3 -c "
import requests, os
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
response = requests.get(
    f'{SUPABASE_URL}/rest/v1/users?email=eq.cliente@test.com',
    headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
)
print(response.json())
"
```

### Probar login con curl:
```bash
curl -X POST "https://clarisa-sustain.preview.emergentagent.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@test.com", "password": "password123"}'
```

---

**Última actualización:** 2025-11-19
**Estado:** ✅ Todos los usuarios verificados y funcionales
