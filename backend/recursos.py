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
        accion = body.accion
        
        # Verificar que existe el recurso
        recursos = supabase_request('GET', 'recursos', params={'id': f'eq.{recurso_id}'})
        if not recursos or len(recursos) == 0:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
        
        recurso = recursos[0]
        
        # Preparar datos según la acción
        datos = {'user_id': user_id, 'recurso_id': recurso_id}
        
        if accion == 'visto':
            datos['visto'] = True
            datos['fecha_visto'] = datetime.utcnow().isoformat()
            
            # Incrementar contador de vistas
            supabase_request('PATCH', f'recursos?id=eq.{recurso_id}', 
                           data={'vistas': (recurso.get('vistas', 0) + 1)})
            
        elif accion == 'descargado':
            datos['descargado'] = True
            datos['fecha_descargado'] = datetime.utcnow().isoformat()
            
            # Incrementar contador de descargas
            supabase_request('PATCH', f'recursos?id=eq.{recurso_id}', 
                           data={'descargas': (recurso.get('descargas', 0) + 1)})
            
        elif accion == 'completado':
            datos['completado'] = True
            datos['fecha_completado'] = datetime.utcnow().isoformat()
        else:
            raise HTTPException(status_code=400, detail="Acción no válida")
        
        # Upsert en recursos_usuario
        # Primero intentar obtener el registro existente
        existente = supabase_request('GET', 'recursos_usuario', 
                                    params={'user_id': f'eq.{user_id}', 'recurso_id': f'eq.{recurso_id}'})
        
        if existente and len(existente) > 0:
            # Actualizar
            supabase_request('PATCH', f'recursos_usuario?user_id=eq.{user_id}&recurso_id=eq.{recurso_id}', 
                           data=datos)
        else:
            # Insertar
            supabase_request('POST', 'recursos_usuario', data=datos)
        
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
        
        datos = {
            'user_id': user_id,
            'recurso_id': recurso_id,
            'calificacion': body.calificacion,
            'comentario': body.comentario
        }
        
        # Verificar si existe
        existente = supabase_request('GET', 'recursos_usuario', 
                                    params={'user_id': f'eq.{user_id}', 'recurso_id': f'eq.{recurso_id}'})
        
        if existente and len(existente) > 0:
            # Actualizar
            supabase_request('PATCH', f'recursos_usuario?user_id=eq.{user_id}&recurso_id=eq.{recurso_id}', 
                           data=datos)
        else:
            # Insertar
            supabase_request('POST', 'recursos_usuario', data=datos)
        
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
        # Obtener total de recursos publicados
        recursos = supabase_request('GET', 'recursos', params={'publicado': 'eq.true', 'select': 'id'})
        total_recursos = len(recursos) if recursos else 0
        
        # Obtener interacciones del usuario
        interacciones = supabase_request('GET', 'recursos_usuario', params={'user_id': f'eq.{user_id}'})
        
        recursos_vistos = 0
        recursos_completados = 0
        recursos_descargados = 0
        
        if interacciones:
            for interaccion in interacciones:
                if interaccion.get('visto'):
                    recursos_vistos += 1
                if interaccion.get('completado'):
                    recursos_completados += 1
                if interaccion.get('descargado'):
                    recursos_descargados += 1
        
        return {
            'recursos_vistos': recursos_vistos,
            'recursos_completados': recursos_completados,
            'recursos_descargados': recursos_descargados,
            'total_recursos': total_recursos
        }
    
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")
