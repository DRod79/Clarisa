"""
Sistema de Notificaciones API
Endpoints para gestión de notificaciones de usuarios
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import requests

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# ============================================
# MODELOS
# ============================================

class NotificacionResponse(BaseModel):
    id: str
    tipo: str
    titulo: str
    mensaje: str
    link: Optional[str] = None
    leida: bool
    created_at: str
    leida_at: Optional[str] = None

# ============================================
# UTILIDADES
# ============================================

def supabase_request(method: str, endpoint: str, data: dict = None, params: dict = None):
    """Hace petición a Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=params, timeout=10)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data, timeout=10)
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error en petición Supabase: {e}")
        return None

# ============================================
# ENDPOINTS
# ============================================

@router.get("/notificaciones")
async def obtener_notificaciones(
    user_id: str,
    solo_no_leidas: bool = False,
    limit: int = 50
):
    """Obtiene las notificaciones del usuario"""
    try:
        params = {
            'user_id': f'eq.{user_id}',
            'order': 'created_at.desc',
            'limit': limit
        }
        
        if solo_no_leidas:
            params['leida'] = 'eq.false'
        
        notificaciones = supabase_request('GET', 'notificaciones', params=params)
        
        if notificaciones is None:
            raise HTTPException(status_code=500, detail="Error al obtener notificaciones")
        
        return notificaciones
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo notificaciones: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener notificaciones")


@router.post("/notificaciones/{notif_id}/marcar-leida")
async def marcar_notificacion_leida(notif_id: str, user_id: str):
    """Marca una notificación como leída"""
    try:
        response = supabase_request(
            'PATCH',
            f'notificaciones?id=eq.{notif_id}&user_id=eq.{user_id}',
            data={'leida': True, 'leida_at': datetime.utcnow().isoformat()}
        )
        
        if not response:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        return {"success": True, "message": "Notificación marcada como leída"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error marcando notificación: {e}")
        raise HTTPException(status_code=500, detail="Error al marcar notificación")


@router.post("/notificaciones/marcar-todas-leidas")
async def marcar_todas_leidas(user_id: str):
    """Marca todas las notificaciones del usuario como leídas"""
    try:
        response = supabase_request(
            'PATCH',
            f'notificaciones?user_id=eq.{user_id}&leida=eq.false',
            data={'leida': True, 'leida_at': datetime.utcnow().isoformat()}
        )
        
        return {"success": True, "message": "Todas las notificaciones marcadas como leídas"}
    
    except Exception as e:
        print(f"Error marcando todas como leídas: {e}")
        raise HTTPException(status_code=500, detail="Error al marcar notificaciones")


@router.get("/notificaciones/stats")
async def obtener_stats_notificaciones(user_id: str):
    """Obtiene estadísticas de notificaciones del usuario"""
    try:
        # Total de notificaciones
        todas = supabase_request('GET', 'notificaciones', params={'user_id': f'eq.{user_id}', 'select': 'id'})
        
        # No leídas
        no_leidas = supabase_request('GET', 'notificaciones', 
                                     params={'user_id': f'eq.{user_id}', 'leida': 'eq.false', 'select': 'id'})
        
        return {
            'total': len(todas) if todas else 0,
            'no_leidas': len(no_leidas) if no_leidas else 0,
            'leidas': (len(todas) - len(no_leidas)) if (todas and no_leidas) else 0
        }
    
    except Exception as e:
        print(f"Error obteniendo stats: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener estadísticas")


@router.post("/notificaciones/crear")
async def crear_notificacion(
    user_id: str,
    tipo: str,
    titulo: str,
    mensaje: str,
    link: Optional[str] = None
):
    """Crea una nueva notificación (uso interno/admin)"""
    try:
        notif_data = {
            'user_id': user_id,
            'tipo': tipo,
            'titulo': titulo,
            'mensaje': mensaje,
            'link': link
        }
        
        response = supabase_request('POST', 'notificaciones', data=notif_data)
        
        if not response:
            raise HTTPException(status_code=500, detail="Error al crear notificación")
        
        return response[0]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creando notificación: {e}")
        raise HTTPException(status_code=500, detail="Error al crear notificación")
