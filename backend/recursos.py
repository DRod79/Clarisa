"""
CLARISA - API de Recursos
Endpoints para la biblioteca de contenido educativo
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import requests

router = APIRouter()

# Configuración Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# ============================================
# MODELOS
# ============================================

class RecursoResponse(BaseModel):
    id: str
    titulo: str
    descripcion: str
    tipo: str
    categoria: str
    contenido: Optional[str] = None
    url_externo: Optional[str] = None
    archivo_url: Optional[str] = None
    autor: Optional[str] = None
    duracion_minutos: Optional[int] = None
    nivel_dificultad: Optional[str] = None
    tags: List[str] = []
    acceso_requerido: str
    fase_relacionada: Optional[int] = None
    vistas: int = 0
    descargas: int = 0
    publicado: bool = True
    destacado: bool = False
    
    # Datos de interacción del usuario
    visto: bool = False
    completado: bool = False
    calificacion: Optional[int] = None

class RecursoDetalleResponse(RecursoResponse):
    created_at: str
    updated_at: str

class MarcarAccionRequest(BaseModel):
    accion: str  # 'visto', 'descargado', 'completado'

class CalificarRecursoRequest(BaseModel):
    calificacion: int
    comentario: Optional[str] = None

# ============================================
# UTILIDADES
# ============================================

def supabase_request(method: str, endpoint: str, data: dict = None, params: dict = None):
    """Hace una petición a Supabase REST API"""
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

def verificar_acceso_recurso(recurso: dict, user_rol: str) -> bool:
    """Verifica si el usuario tiene acceso al recurso"""
    acceso = recurso.get('acceso_requerido', 'gratuito')
    
    if acceso == 'todos' or acceso == 'gratuito':
        return True
    
    if acceso == 'pagado' and user_rol in ['cliente_pagado', 'admin']:
        return True
    
    return False

# ============================================
# ENDPOINTS
# ============================================

@router.get("/recursos", response_model=List[RecursoResponse])
async def obtener_recursos(
    user_id: str,
    user_rol: str = 'cliente_gratuito',
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
    fase: Optional[int] = None,
    destacados: bool = False
):
    """
    Obtiene lista de recursos disponibles para el usuario
    Filtros: tipo, categoria, fase, destacados
    """
    try:
        # Construir query parameters para Supabase
        params = {'publicado': 'eq.true', 'order': 'destacado.desc,created_at.desc'}
        
        if tipo:
            params['tipo'] = f'eq.{tipo}'
        if categoria:
            params['categoria'] = f'eq.{categoria}'
        if fase is not None:
            params['fase_relacionada'] = f'eq.{fase}'
        if destacados:
            params['destacado'] = 'eq.true'
        
        # Obtener recursos
        recursos = supabase_request('GET', 'recursos', params=params)
        
        if recursos is None:
            raise HTTPException(status_code=500, detail="Error al obtener recursos de Supabase")
        
        # Obtener interacciones del usuario
        user_interacciones = supabase_request('GET', 'recursos_usuario', params={'user_id': f'eq.{user_id}'})
        interacciones_dict = {}
        if user_interacciones:
            for interaccion in user_interacciones:
                interacciones_dict[interaccion['recurso_id']] = interaccion
        
        # Combinar datos y filtrar por acceso
        recursos_filtrados = []
        for recurso in recursos:
            if verificar_acceso_recurso(recurso, user_rol):
                interaccion = interacciones_dict.get(recurso['id'], {})
                recursos_filtrados.append({
                    **recurso,
                    'visto': interaccion.get('visto', False),
                    'completado': interaccion.get('completado', False),
                    'calificacion': interaccion.get('calificacion')
                })
        
        return recursos_filtrados
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo recursos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener recursos: {str(e)}")


@router.get("/recursos/{recurso_id}", response_model=RecursoDetalleResponse)
async def obtener_recurso_detalle(
    recurso_id: str,
    user_id: str,
    user_rol: str = 'cliente_gratuito'
):
    """
    Obtiene detalle completo de un recurso específico
    """
    try:
        # Obtener recurso
        recursos = supabase_request('GET', 'recursos', params={'id': f'eq.{recurso_id}', 'publicado': 'eq.true'})
        
        if not recursos or len(recursos) == 0:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
        
        recurso = recursos[0]
        
        # Verificar acceso
        if not verificar_acceso_recurso(recurso, user_rol):
            raise HTTPException(status_code=403, detail="No tienes acceso a este recurso")
        
        # Obtener interacción del usuario
        interacciones = supabase_request('GET', 'recursos_usuario', 
                                       params={'user_id': f'eq.{user_id}', 'recurso_id': f'eq.{recurso_id}'})
        
        interaccion = interacciones[0] if interacciones and len(interacciones) > 0 else {}
        
        return {
            **recurso,
            'visto': interaccion.get('visto', False),
            'completado': interaccion.get('completado', False),
            'calificacion': interaccion.get('calificacion')
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo detalle de recurso: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener recurso: {str(e)}")


@router.post("/recursos/{recurso_id}/accion")
async def marcar_accion_recurso(
    recurso_id: str,
    user_id: str,
    body: MarcarAccionRequest
):
    """
    Marca una acción del usuario sobre un recurso (visto, descargado, completado)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        accion = body.accion
        
        if accion == 'visto':
            # Llamar función que registra vista
            cursor.execute(
                "SELECT registrar_vista_recurso(%s, %s)",
                [user_id, recurso_id]
            )
        elif accion == 'descargado':
            # Llamar función que registra descarga
            cursor.execute(
                "SELECT registrar_descarga_recurso(%s, %s)",
                [user_id, recurso_id]
            )
        elif accion == 'completado':
            # Marcar como completado
            cursor.execute("""
                INSERT INTO public.recursos_usuario (
                    user_id, recurso_id, completado, fecha_completado
                ) VALUES (%s, %s, TRUE, NOW())
                ON CONFLICT (user_id, recurso_id)
                DO UPDATE SET 
                    completado = TRUE,
                    fecha_completado = NOW()
            """, [user_id, recurso_id])
        else:
            raise HTTPException(status_code=400, detail="Acción no válida")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": f"Acción '{accion}' registrada correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error marcando acción: {e}")
        raise HTTPException(status_code=500, detail=f"Error al registrar acción: {str(e)}")


@router.post("/recursos/{recurso_id}/calificar")
async def calificar_recurso(
    recurso_id: str,
    user_id: str,
    body: CalificarRecursoRequest
):
    """
    Permite al usuario calificar un recurso (1-5 estrellas)
    """
    try:
        if body.calificacion < 1 or body.calificacion > 5:
            raise HTTPException(status_code=400, detail="La calificación debe estar entre 1 y 5")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insertar o actualizar calificación
        cursor.execute("""
            INSERT INTO public.recursos_usuario (
                user_id, recurso_id, calificacion, comentario
            ) VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, recurso_id)
            DO UPDATE SET 
                calificacion = EXCLUDED.calificacion,
                comentario = EXCLUDED.comentario,
                updated_at = NOW()
        """, [user_id, recurso_id, body.calificacion, body.comentario])
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Calificación guardada correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error guardando calificación: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar calificación: {str(e)}")


@router.get("/recursos/stats/resumen")
async def obtener_stats_recursos(user_id: str):
    """
    Obtiene estadísticas de recursos para el usuario
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Contar recursos vistos, completados, etc.
        query = """
            SELECT 
                COUNT(CASE WHEN ru.visto = TRUE THEN 1 END) as recursos_vistos,
                COUNT(CASE WHEN ru.completado = TRUE THEN 1 END) as recursos_completados,
                COUNT(CASE WHEN ru.descargado = TRUE THEN 1 END) as recursos_descargados,
                (SELECT COUNT(*) FROM public.recursos WHERE publicado = TRUE) as total_recursos
            FROM public.recursos_usuario ru
            WHERE ru.user_id = %s
        """
        
        cursor.execute(query, [user_id])
        stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return stats or {
            'recursos_vistos': 0,
            'recursos_completados': 0,
            'recursos_descargados': 0,
            'total_recursos': 0
        }
    
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")
