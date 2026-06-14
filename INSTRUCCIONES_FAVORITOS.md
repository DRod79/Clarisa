# 📋 Instrucciones para Probar Favoritos - ACTUALIZADO

## ⚠️ PASO PREVIO OBLIGATORIO

**ANTES DE PROBAR, DEBES EJECUTAR EL SCHEMA SQL EN SUPABASE:**

1. Ve a tu proyecto Supabase: https://supabase.com
2. Click en **SQL Editor** en el menú lateral
3. Copia el contenido del archivo `/app/backend/gamificacion_schema.sql`
4. Pega en el editor y click **Run**

Esto creará las tablas:
- `recursos_favoritos`
- `user_logros`

---

## ✅ Cómo Agregar Recursos a Favoritos

### Paso 1: Login
1. Ir a: https://recursos-sandbox.preview.emergentagent.com/login
2. Usuario: `cliente@test.com`
3. Password: `pass123`

### Paso 2: Navegar a Recursos
1. En el menú lateral, click en **"Recursos"**
2. Verás la biblioteca de recursos con tarjetas

### Paso 3: Marcar como Favorito
1. En cada tarjeta de recurso, verás un **ícono de corazón (❤️) en la esquina superior izquierda**
2. El corazón está sobre el fondo verde/degradado de la tarjeta
3. **Click en el corazón:**
   - Si está vacío (gris): Se agregará a favoritos
   - Si está rojo (lleno): Se quitará de favoritos
4. Verás un toast de confirmación

**Visual:**
```
┌─────────────────────────┐
│ ❤️                   👁️ │ <- Corazón arriba izquierda
│                         │
│      📄 ÍCONO          │
│                         │
└─────────────────────────┘
│ Título del Recurso     │
│ Descripción...         │
│ [Ver] [Descargar]      │
└─────────────────────────┘
```

### Paso 4: Ver Favoritos
1. En el menú lateral, click en **"Favoritos"** (nuevo enlace con ícono ❤️)
2. Verás todos tus recursos favoritos en una cuadrícula
3. Puedes:
   - Click en "Ver Recurso" para abrir el recurso
   - Click en el ícono de basura 🗑️ para quitar de favoritos

---

## 🎮 Probar Sistema de Gamificación

### Ver Panel de Logros
1. En el menú lateral, click en **"Mi Progreso"**
2. En la parte superior verás:
   - **Card verde grande** con:
     - Tu nivel actual (1-5)
     - Puntos totales
     - Barra de progreso de logros
   - **4 cards pequeñas** con estadísticas:
     - Recursos vistos
     - Favoritos (se actualiza al agregar favoritos)
     - Logros obtenidos
     - Tickets creados
   - **Lista de logros desbloqueados** (si tienes)

---

## 🧪 Testing Rápido

**Test 1: Agregar Favorito**
1. Recursos → Click en corazón de un recurso
2. Verificar toast: "Agregado a favoritos"
3. Verificar que el corazón se pone rojo

**Test 2: Verificar en Favoritos**
1. Menú → Favoritos
2. Verificar que aparece el recurso agregado

**Test 3: Quitar Favorito**
1. En Favoritos → Click en ícono de basura
2. Confirmar
3. Verificar que desaparece de la lista

**Test 4: Ver Estadística en Mi Progreso**
1. Mi Progreso → Ver card "Favoritos"
2. Debe mostrar el conteo correcto

---

## ❌ Solución de Problemas

### Error: "Sistema de favoritos no disponible"
**Causa:** Las tablas no existen en Supabase
**Solución:** Ejecutar el schema SQL (ver paso previo obligatorio)

### No veo el corazón en las tarjetas
**Causa:** Caché del navegador
**Solución:** 
1. Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac)
2. O limpia caché y recarga

### El corazón no responde al click
**Causa:** JavaScript no cargado
**Solución:**
1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Recarga la página

### Favoritos no se guardan
**Causa:** Backend no responde
**Solución:**
1. Verifica que el backend esté corriendo
2. Abre Network tab en DevTools
3. Busca la llamada a `/api/favoritos`
4. Verifica el código de respuesta

---

## 📸 Screenshots Esperados

1. **Recursos con corazón:**
   - Tarjetas con corazón en esquina superior izquierda
   - Corazón gris cuando no es favorito
   - Corazón rojo cuando es favorito

2. **Página de Favoritos:**
   - Grid con recursos guardados
   - Botones "Ver Recurso" y botón de basura
   - Contador arriba: "X recursos guardados"

3. **Mi Progreso:**
   - Panel de gamificación verde arriba
   - Card "Favoritos" mostrando conteo correcto

---

## ✅ Checklist de Verificación

- [ ] Schema SQL ejecutado en Supabase
- [ ] Login exitoso con cliente@test.com
- [ ] Veo corazones en tarjetas de recursos
- [ ] Puedo agregar favoritos (corazón se pone rojo)
- [ ] Veo toast de confirmación
- [ ] Página "Favoritos" muestra recursos guardados
- [ ] Puedo quitar favoritos
- [ ] Conteo en "Mi Progreso" es correcto

---

Si todo lo anterior funciona, ¡el sistema de favoritos está completamente operativo! 🎉
