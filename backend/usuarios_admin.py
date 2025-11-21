"""
API endpoints para gestión de usuarios desde el panel Admin
Permite listar, editar, cambiar planes y desactivar usuarios
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import requests
import os
from datetime import datetime

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')


class ActualizarUsuario(BaseModel):
    nombre_completo: Optional[str] = None
    organizacion: Optional[str] = None
    rol: Optional[str] = None
    plan_actual: Optional[str] = None
    pais: Optional[str] = None
    puesto: Optional[str] = None
    telefono: Optional[str] = None


class CambiarPlan(BaseModel):
    plan_actual: str
    suscripcion_activa: bool


@router.get("/admin/usuarios")
async def listar_usuarios(
    rol: Optional[str] = Query(None, description="Filtrar por rol"),
    plan: Optional[str] = Query(None, description="Filtrar por plan"),
    search: Optional[str] = Query(None, description="Buscar por nombre o email"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    Lista todos los usuarios con filtros opcionales
    - rol: admin, cliente_pagado, cliente_gratuito
    - plan: gratuito, basico, pro
    - search: búsqueda en nombre_completo y email
    """
    try:
        # Construir query
        params = []
        
        if rol:
            params.append(f"rol=eq.{rol}")
        
        if plan:
            params.append(f"plan_actual=eq.{plan}")
        
        # Para búsqueda, necesitamos hacer filtro en código porque Supabase REST API
        # tiene limitaciones con ILIKE en múltiples campos
        query_string = "&".join(params) if params else ""
        
        url = f"{SUPABASE_URL}/rest/v1/users?{query_string}&order=created_at.desc&limit={limit}&offset={offset}"
        
        response = requests.get(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            
            # Aplicar búsqueda si se proporciona
            if search:
                search_lower = search.lower()
                usuarios = [
                    u for u in usuarios 
                    if (u.get('nombre_completo', '').lower().find(search_lower) != -1 or
                        u.get('email', '').lower().find(search_lower) != -1)
                ]
            
            # Obtener el total count del header
            content_range = response.headers.get('Content-Range', '0-0/0')
            total = int(content_range.split('/')[-1]) if '/' in content_range else len(usuarios)
            
            # Limpiar datos sensibles
            for usuario in usuarios:
                usuario.pop('password_hash', None)
            
            return {
                'usuarios': usuarios,
                'total': total,
                'limit': limit,
                'offset': offset
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener usuarios: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/usuarios/{user_id}")
async def obtener_usuario(user_id: str):
    """
    Obtiene los detalles completos de un usuario específico
    """
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            if usuarios:
                usuario = usuarios[0]
                # Limpiar datos sensibles
                usuario.pop('password_hash', None)
                return usuario
            else:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener usuario: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/admin/usuarios/{user_id}")
async def actualizar_usuario(user_id: str, datos: ActualizarUsuario):
    """
    Actualiza la información de un usuario
    Permite cambiar: nombre, organización, rol, plan, país, puesto, teléfono
    """
    try:
        # Preparar datos para actualizar
        update_data = {}
        
        if datos.nombre_completo is not None:
            update_data['nombre_completo'] = datos.nombre_completo
        
        if datos.organizacion is not None:
            update_data['organizacion'] = datos.organizacion
        
        if datos.rol is not None:
            # Validar rol
            roles_validos = ['admin', 'cliente_pagado', 'cliente_gratuito']
            if datos.rol not in roles_validos:
                raise HTTPException(
                    status_code=400,
                    detail=f"Rol inválido. Debe ser uno de: {', '.join(roles_validos)}"
                )
            update_data['rol'] = datos.rol
        
        if datos.plan_actual is not None:
            update_data['plan_actual'] = datos.plan_actual
        
        if datos.pais is not None:
            update_data['pais'] = datos.pais
        
        if datos.puesto is not None:
            update_data['puesto'] = datos.puesto
        
        if datos.telefono is not None:
            update_data['telefono'] = datos.telefono
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")
        
        # Agregar timestamp
        update_data['updated_at'] = datetime.now().isoformat()
        
        # Actualizar en Supabase
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            if usuarios:
                usuario = usuarios[0]
                usuario.pop('password_hash', None)
                return {
                    'message': 'Usuario actualizado exitosamente',
                    'usuario': usuario
                }
            else:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al actualizar usuario: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/admin/usuarios/{user_id}/cambiar-plan")
async def cambiar_plan_usuario(user_id: str, datos: CambiarPlan):
    """
    Cambia el plan de suscripción de un usuario
    También actualiza el campo suscripcion_activa
    """
    try:
        # Validar plan
        planes_validos = ['gratuito', 'basico', 'pro']
        if datos.plan_actual not in planes_validos:
            raise HTTPException(
                status_code=400,
                detail=f"Plan inválido. Debe ser uno de: {', '.join(planes_validos)}"
            )
        
        # Preparar datos
        update_data = {
            'plan_actual': datos.plan_actual,
            'suscripcion_activa': datos.suscripcion_activa,
            'updated_at': datetime.now().isoformat()
        }
        
        # Si es plan pagado, también actualizar el rol
        if datos.plan_actual in ['basico', 'pro']:
            update_data['rol'] = 'cliente_pagado'
        elif datos.plan_actual == 'gratuito':
            update_data['rol'] = 'cliente_gratuito'
        
        # Actualizar en Supabase
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            if usuarios:
                usuario = usuarios[0]
                usuario.pop('password_hash', None)
                return {
                    'message': f'Plan cambiado a {datos.plan_actual} exitosamente',
                    'usuario': usuario
                }
            else:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al cambiar plan: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/usuarios/{user_id}")
async def desactivar_usuario(user_id: str):
    """
    Desactiva un usuario (soft delete)
    No elimina el registro, solo marca como inactivo
    """
    try:
        # Primero verificar que el usuario existe
        check_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if check_response.status_code == 200:
            usuarios = check_response.json()
            if not usuarios:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
            # Verificar que no sea el último admin
            if usuarios[0].get('rol') == 'admin':
                # Contar admins
                admin_response = requests.get(
                    f"{SUPABASE_URL}/rest/v1/users?rol=eq.admin",
                    headers={
                        'apikey': SUPABASE_KEY,
                        'Authorization': f'Bearer {SUPABASE_KEY}'
                    },
                    timeout=10
                )
                
                if admin_response.status_code == 200:
                    admins = admin_response.json()
                    if len(admins) <= 1:
                        raise HTTPException(
                            status_code=400,
                            detail="No se puede desactivar el último administrador del sistema"
                        )
        
        # Marcar como inactivo (usaremos suscripcion_activa como indicador)
        update_data = {
            'suscripcion_activa': False,
            'updated_at': datetime.now().isoformat()
        }
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            return {
                'message': 'Usuario desactivado exitosamente',
                'user_id': user_id
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al desactivar usuario: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/usuarios/{user_id}/reactivar")
async def reactivar_usuario(user_id: str):
    """
    Reactiva un usuario previamente desactivado
    """
    try:
        update_data = {
            'suscripcion_activa': True,
            'updated_at': datetime.now().isoformat()
        }
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=update_data,
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            if usuarios:
                return {
                    'message': 'Usuario reactivado exitosamente',
                    'user_id': user_id
                }
            else:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al reactivar usuario: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
