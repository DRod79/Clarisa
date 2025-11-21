"""
API endpoints para sistema de gamificación
Gestiona logros, badges y puntos de los usuarios
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from datetime import datetime
from typing import List, Optional

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')


class OtorgarLogro(BaseModel):
    user_id: str
    logro_codigo: str


# Definición de logros disponibles
LOGROS_DISPONIBLES = {
    'primer_recurso': {
        'titulo': 'Primer Paso',
        'descripcion': 'Has visto tu primer recurso',
        'icono': '🎯',
        'puntos': 10
    },
    'diagnostico_completado': {
        'titulo': 'Conocimiento Inicial',
        'descripcion': 'Has completado el diagnóstico inicial',
        'icono': '📊',
        'puntos': 50
    },
    'fase_1_completa': {
        'titulo': 'Fase 1 Completada',
        'descripcion': 'Has completado todos los recursos de la Fase 1',
        'icono': '⭐',
        'puntos': 100
    },
    'fase_2_completa': {
        'titulo': 'Fase 2 Completada',
        'descripcion': 'Has completado todos los recursos de la Fase 2',
        'icono': '⭐⭐',
        'puntos': 100
    },
    'fase_3_completa': {
        'titulo': 'Fase 3 Completada',
        'descripcion': 'Has completado todos los recursos de la Fase 3',
        'icono': '⭐⭐⭐',
        'puntos': 100
    },
    'primer_ticket': {
        'titulo': 'Buscador de Ayuda',
        'descripcion': 'Has creado tu primer ticket de soporte',
        'icono': '🎫',
        'puntos': 20
    },
    'recursos_favoritos_5': {
        'titulo': 'Coleccionista',
        'descripcion': 'Has guardado 5 recursos en favoritos',
        'icono': '❤️',
        'puntos': 30
    },
    'semana_activa': {
        'titulo': 'Usuario Activo',
        'descripcion': 'Has iniciado sesión durante 7 días consecutivos',
        'icono': '🔥',
        'puntos': 75
    },
    'todas_fases': {
        'titulo': 'Maestro NIIF',
        'descripcion': 'Has completado todas las 5 fases',
        'icono': '🏆',
        'puntos': 500
    }
}


@router.get("/gamificacion/logros")
async def obtener_todos_logros():
    """
    Obtiene la lista de todos los logros disponibles
    """
    return {
        'logros': LOGROS_DISPONIBLES
    }


@router.get("/gamificacion/usuario/{user_id}/logros")
async def obtener_logros_usuario(user_id: str):
    """
    Obtiene los logros obtenidos por un usuario específico
    """
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/user_logros?user_id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            logros = response.json()
            
            # Enriquecer con información del logro
            logros_completos = []
            for logro in logros:
                codigo = logro.get('logro_codigo')
                if codigo in LOGROS_DISPONIBLES:
                    logros_completos.append({
                        **logro,
                        **LOGROS_DISPONIBLES[codigo]
                    })
            
            # Calcular puntos totales
            puntos_totales = sum(l.get('puntos', 0) for l in logros_completos)
            
            return {
                'logros': logros_completos,
                'puntos_totales': puntos_totales,
                'cantidad': len(logros_completos)
            }
        else:
            # Si la tabla no existe, retornar vacío
            return {
                'logros': [],
                'puntos_totales': 0,
                'cantidad': 0
            }
            
    except Exception as e:
        # Si hay error (tabla no existe), retornar vacío
        return {
            'logros': [],
            'puntos_totales': 0,
            'cantidad': 0
        }


@router.post("/gamificacion/usuario/{user_id}/otorgar-logro")
async def otorgar_logro(user_id: str, datos: OtorgarLogro):
    """
    Otorga un logro a un usuario
    Verifica que no lo tenga ya
    """
    try:
        logro_codigo = datos.logro_codigo
        
        # Verificar que el logro existe
        if logro_codigo not in LOGROS_DISPONIBLES:
            raise HTTPException(status_code=400, detail="Logro no existe")
        
        # Verificar si ya tiene el logro
        try:
            check_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/user_logros?user_id=eq.{user_id}&logro_codigo=eq.{logro_codigo}",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                timeout=10
            )
            
            if check_response.status_code == 200:
                existing = check_response.json()
                if existing:
                    return {
                        'message': 'Usuario ya tiene este logro',
                        'nuevo': False
                    }
        except:
            pass
        
        # Otorgar logro
        logro_data = {
            'user_id': user_id,
            'logro_codigo': logro_codigo,
            'obtenido_at': datetime.now().isoformat()
        }
        
        try:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/user_logros",
                headers={
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'return=representation'
                },
                json=logro_data,
                timeout=10
            )
            
            if response.status_code == 201:
                return {
                    'message': 'Logro otorgado exitosamente',
                    'nuevo': True,
                    'logro': {
                        **logro_data,
                        **LOGROS_DISPONIBLES[logro_codigo]
                    }
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error al otorgar logro: {response.text}"
                )
        except Exception as e:
            # Si la tabla no existe, simplemente retornar que no se pudo otorgar
            return {
                'message': 'Sistema de logros no disponible',
                'nuevo': False
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamificacion/usuario/{user_id}/estadisticas")
async def obtener_estadisticas_usuario(user_id: str):
    """
    Obtiene estadísticas de gamificación del usuario
    """
    try:
        estadisticas = {
            'puntos_totales': 0,
            'logros_obtenidos': 0,
            'logros_totales': len(LOGROS_DISPONIBLES),
            'progreso_porcentaje': 0,
            'nivel': 1,
            'recursos_vistos': 0,
            'recursos_descargados': 0,
            'recursos_favoritos': 0,
            'tickets_creados': 0
        }
        
        # Obtener logros
        try:
            logros_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/user_logros?user_id=eq.{user_id}",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                timeout=10
            )
            
            if logros_response.status_code == 200:
                logros = logros_response.json()
                estadisticas['logros_obtenidos'] = len(logros)
                
                # Calcular puntos
                for logro in logros:
                    codigo = logro.get('logro_codigo')
                    if codigo in LOGROS_DISPONIBLES:
                        estadisticas['puntos_totales'] += LOGROS_DISPONIBLES[codigo]['puntos']
                
                # Calcular progreso
                if estadisticas['logros_totales'] > 0:
                    estadisticas['progreso_porcentaje'] = int(
                        (estadisticas['logros_obtenidos'] / estadisticas['logros_totales']) * 100
                    )
                
                # Calcular nivel basado en puntos
                # Nivel 1: 0-100, Nivel 2: 101-300, Nivel 3: 301-600, etc.
                puntos = estadisticas['puntos_totales']
                if puntos <= 100:
                    estadisticas['nivel'] = 1
                elif puntos <= 300:
                    estadisticas['nivel'] = 2
                elif puntos <= 600:
                    estadisticas['nivel'] = 3
                elif puntos <= 1000:
                    estadisticas['nivel'] = 4
                else:
                    estadisticas['nivel'] = 5
        except:
            pass
        
        # Obtener recursos favoritos
        try:
            favoritos_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{user_id}&select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if favoritos_response.status_code == 200:
                content_range = favoritos_response.headers.get('Content-Range', '0-0/0')
                estadisticas['recursos_favoritos'] = int(content_range.split('/')[-1])
        except:
            pass
        
        # Obtener tickets
        try:
            tickets_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/tickets?user_id=eq.{user_id}&select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if tickets_response.status_code == 200:
                content_range = tickets_response.headers.get('Content-Range', '0-0/0')
                estadisticas['tickets_creados'] = int(content_range.split('/')[-1])
        except:
            pass
        
        return estadisticas
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
