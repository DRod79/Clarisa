# 🔐 CREDENCIALES REALES - CLARISA

## ⚠️ PROBLEMA ACTUAL
**El login no funciona debido a un error de DNS del cluster de Kubernetes que impide conectarse a Supabase.**

**Error:** `[Errno -2] Name or service not known` para `sgmguxorpixygluwzjug.supabase.co`

---

## 📝 CREDENCIALES ENCONTRADAS EN SCRIPTS

Basado en el análisis de los scripts de configuración en `/app/backend/`, estas son las credenciales que se han configurado en diferentes momentos:

### Opción 1: Según reset_passwords.py (Más Reciente)
```
ADMIN:
  Email: admin@clarisa.com
  Password: Test123*
  
USUARIO TEST:
  Email: prueba@test.com
  Password: Test123*
```

### Opción 2: Según crear_cliente_test.py
```
CLIENTE:
  Email: cliente@test.com
  Password: test123
```

### Opción 3: Según USUARIOS_PRUEBA.md (Documentación)
```
ADMIN:
  Email: admin@clarisa.com
  Password: admin123
  
CLIENTE:
  Email: cliente@test.com
  Password: pass123
```

---

## 🔍 ANÁLISIS

El problema es que **no puedo verificar cuál es la contraseña correcta actual** porque:

1. **Error de DNS:** El cluster de Kubernetes no puede resolver el dominio de Supabase
2. **Múltiples cambios:** Los scripts muestran que las contraseñas se han cambiado varias veces
3. **Sin acceso directo:** No puedo consultar la base de datos para verificar el password_hash actual

---

## ✅ SOLUCIÓN RECOMENDADA

### Paso 1: Resolver Problema de DNS (CRÍTICO)

Este es un problema de infraestructura que debe ser resuelto por el equipo de soporte de Emergent:

1. **Contactar Soporte de Emergent**
2. **Solicitar:** Configuración de DNS externo en el cluster de Kubernetes
3. **Problema específico:** El pod no puede resolver `sgmguxorpixygluwzjug.supabase.co`

### Paso 2: Una vez resuelto el DNS, ejecutar script de verificación

Una vez que Supabase sea accesible, ejecutar:

```bash
cd /app/backend
export $(cat .env | grep -E "SUPABASE_URL|SUPABASE_KEY" | xargs)
python3 verify_users.py
```

Este script mostrará:
- Todos los usuarios que existen en la base de datos
- Sus emails y roles
- Verificará qué passwords funcionan

### Paso 3: Resetear passwords si es necesario

Si las contraseñas no funcionan, ejecutar:

```bash
cd /app/backend
export $(cat .env | grep -E "SUPABASE_URL|SUPABASE_KEY" | xargs)
python3 reset_passwords.py
```

---

## 🎯 MIENTRAS TANTO

**Puedes probar todas estas combinaciones cuando se resuelva el DNS:**

1. admin@clarisa.com / Test123*
2. admin@clarisa.com / admin123
3. cliente@test.com / test123
4. cliente@test.com / pass123
5. cliente@test.com / Test123*
6. prueba@test.com / Test123*

---

## 📊 ESTADO ACTUAL DEL SISTEMA

✅ **Backend:** Funcionando (puerto 8001)
✅ **Frontend:** Funcionando (puerto 3000)
✅ **MongoDB:** Funcionando (puerto 27017)
✅ **Código:** Sin errores
✅ **Feature "Mis Favoritos":** Implementada correctamente
❌ **Conectividad Supabase:** Bloqueada por DNS

---

## 🔧 COMANDOS ÚTILES (Cuando DNS esté funcionando)

### Ver todos los usuarios:
```bash
cd /app/backend
export $(cat .env | xargs)
python3 -c "
import requests, os
resp = requests.get(
    f'{os.environ[\"SUPABASE_URL\"]}/rest/v1/users',
    headers={'apikey': os.environ['SUPABASE_KEY'], 'Authorization': f'Bearer {os.environ[\"SUPABASE_KEY\"]}'}
)
print(resp.json())
"
```

### Calcular hash de password:
```bash
python3 -c "import hashlib; print(hashlib.sha256('TU_PASSWORD'.encode()).hexdigest())"
```

---

**Última actualización:** 2024-12-04
**Estado:** ⚠️ Esperando resolución de DNS para verificar credenciales reales
