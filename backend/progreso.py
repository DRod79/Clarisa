"""
Progress Module - Backend Logic
Sistema de tracking de progreso S1/S2
"""
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime
import requests
import os

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# ============================================
# PYDANTIC MODELS
# ============================================

class ProgresoUsuario(BaseModel):
    id: str
    user_id: str
    porcentaje_total: int
    ultima_actualizacion: datetime
    fase1_diagnostico_completado: bool
    fase1_porcentaje: int
    fase1_fecha_completado: Optional[datetime] = None
    fase2_materialidad_completado: bool
    fase2_porcentaje: int
    fase2_fecha_completado: Optional[datetime] = None
    fase3_riesgos_completado: bool
    fase3_porcentaje: int
    fase3_fecha_completado: Optional[datetime] = None
    fase4_medicion_completado: bool
    fase4_porcentaje: int
    fase4_fecha_completado: Optional[datetime] = None
    fase5_reporte_completado: bool
    fase5_porcentaje: int
    fase5_fecha_completado: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class AccionProgreso(BaseModel):
    tipo_accion: str
    fase: int
    descripcion: Optional[str] = None
    puntos: int = 10

# ============================================
# FUNCIONES DE PROGRESO
# ============================================

async def obtener_progreso_usuario(user_id: str) -> Optional[Dict]:
    """Obtiene el progreso del usuario"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/progreso_usuario?user_id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            progreso = response.json()
            if progreso:
                return progreso[0]
            else:
                # Si no existe, inicializar
                return await inicializar_progreso_usuario(user_id)
        return None
        
    except Exception as e:
        print(f"Error getting progreso: {e}")
        return None

async def inicializar_progreso_usuario(user_id: str) -> Optional[Dict]:
    """Inicializa el progreso para un nuevo usuario"""
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/progreso_usuario",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json={
                'user_id': user_id,
                'porcentaje_total': 0
            },
            timeout=10
        )
        
        if response.status_code == 201:
            return response.json()[0]
        return None
        
    except Exception as e:
        print(f"Error initializing progreso: {e}")
        return None

async def registrar_accion(user_id: str, accion: AccionProgreso) -> bool:
    """Registra una acción y actualiza el progreso automáticamente"""
    try:
        # Primero asegurar que el usuario tiene un registro de progreso
        progreso = await obtener_progreso_usuario(user_id)
        if not progreso:
            progreso = await inicializar_progreso_usuario(user_id)
            if not progreso:
                return False
        
        # Registrar la acción
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/acciones_progreso",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            json={
                'user_id': user_id,
                'tipo_accion': accion.tipo_accion,
                'fase': accion.fase,
                'descripcion': accion.descripcion,
                'puntos': accion.puntos
            },
            timeout=10
        )
        
        if response.status_code != 201:
            print(f"Error registering action: {response.status_code} - {response.text}")
            return False
        
        # Llamar a la función de Supabase para actualizar el progreso
        rpc_response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/registrar_accion_progreso",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            json={
                'p_user_id': user_id,
                'p_tipo_accion': accion.tipo_accion,
                'p_fase': accion.fase,
                'p_descripcion': accion.descripcion,
                'p_puntos': accion.puntos
            },
            timeout=10
        )
        
        return rpc_response.status_code == 200 or rpc_response.status_code == 204
        
    except Exception as e:
        print(f"Error registering action: {e}")
        import traceback
        traceback.print_exc()
        return False

async def obtener_acciones_usuario(user_id: str, fase: Optional[int] = None) -> List[Dict]:
    """Obtiene las acciones del usuario, opcionalmente filtradas por fase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/acciones_progreso?user_id=eq.{user_id}&order=created_at.desc"
        
        if fase:
            url += f"&fase=eq.{fase}"
        
        response = requests.get(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        return []
        
    except Exception as e:
        print(f"Error getting actions: {e}")
        return []

async def obtener_estadisticas_progreso(user_id: str) -> Dict:
    """Obtiene estadísticas del progreso del usuario"""
    try:
        progreso = await obtener_progreso_usuario(user_id)
        if not progreso:
            return {
                'fases_completadas': 0,
                'fases_en_progreso': 0,
                'fases_pendientes': 5,
                'puntos_totales': 0,
                'ultima_actividad': None
            }
        
        fases_completadas = sum([
            progreso['fase1_diagnostico_completado'],
            progreso['fase2_materialidad_completado'],
            progreso['fase3_riesgos_completado'],
            progreso['fase4_medicion_completado'],
            progreso['fase5_reporte_completado']
        ])
        
        fases_en_progreso = sum([
            1 if 0 < progreso['fase1_porcentaje'] < 100 else 0,
            1 if 0 < progreso['fase2_porcentaje'] < 100 else 0,
            1 if 0 < progreso['fase3_porcentaje'] < 100 else 0,
            1 if 0 < progreso['fase4_porcentaje'] < 100 else 0,
            1 if 0 < progreso['fase5_porcentaje'] < 100 else 0
        ])
        
        fases_pendientes = 5 - fases_completadas - fases_en_progreso
        
        # Obtener puntos totales
        acciones = await obtener_acciones_usuario(user_id)
        puntos_totales = sum([a.get('puntos', 0) for a in acciones])
        
        # Última actividad
        ultima_actividad = acciones[0]['created_at'] if acciones else None
        
        return {
            'fases_completadas': fases_completadas,
            'fases_en_progreso': fases_en_progreso,
            'fases_pendientes': fases_pendientes,
            'puntos_totales': puntos_totales,
            'ultima_actividad': ultima_actividad
        }
        
    except Exception as e:
        print(f"Error getting stats: {e}")
        return {
            'fases_completadas': 0,
            'fases_en_progreso': 0,
            'fases_pendientes': 5,
            'puntos_totales': 0,
            'ultima_actividad': None
        }

# ============================================
# HELPERS PARA REGISTRAR ACCIONES AUTOMÁTICAS
# ============================================

async def registrar_diagnostico_completado(user_id: str) -> bool:
    """Registra que el usuario completó el diagnóstico (Fase 1)"""
    accion = AccionProgreso(
        tipo_accion='diagnostico_completado',
        fase=1,
        descripcion='Diagnóstico NIIF S1/S2 completado',
        puntos=100  # Completa la fase 1
    )
    return await registrar_accion(user_id, accion)

async def registrar_recurso_consultado(user_id: str, fase: int, nombre_recurso: str) -> bool:
    """Registra que el usuario consultó un recurso"""
    accion = AccionProgreso(
        tipo_accion='recurso_consultado',
        fase=fase,
        descripcion=f'Consultó: {nombre_recurso}',
        puntos=5
    )
    return await registrar_accion(user_id, accion)

async def registrar_herramienta_usada(user_id: str, fase: int, nombre_herramienta: str) -> bool:
    """Registra que el usuario usó una herramienta"""
    accion = AccionProgreso(
        tipo_accion='herramienta_usada',
        fase=fase,
        descripcion=f'Usó: {nombre_herramienta}',
        puntos=15
    )
    return await registrar_accion(user_id, accion)
