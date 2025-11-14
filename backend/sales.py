"""
Sales Module - Backend Logic
Gestión de oportunidades de venta y pipeline
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
import requests
import os
import json

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')  # Usar SERVICE_KEY para bypassear RLS en backend

# ============================================
# PYDANTIC MODELS
# ============================================

class PrioridadEnum:
    A1 = "A1"
    A2 = "A2"
    A3 = "A3"
    B1 = "B1"
    B2 = "B2"
    B3 = "B3"
    C1 = "C1"
    C2 = "C2"
    C3 = "C3"

class EtapaPipelineEnum:
    NUEVO_LEAD = "nuevo_lead"
    CALIFICADO = "calificado"
    CONTACTO_INICIAL = "contacto_inicial"
    DIAGNOSTICO_PROFUNDO = "diagnostico_profundo"
    CONSULTORIA_ACTIVA = "consultoria_activa"
    PREPARANDO_SOLUCION = "preparando_solucion"
    NEGOCIACION = "negociacion"
    CERRADO_GANADO = "cerrado_ganado"
    CERRADO_PERDIDO = "cerrado_perdido"
    EN_NUTRICION = "en_nutricion"

class EstadoOportunidadEnum:
    ACTIVO = "activo"
    GANADO = "ganado"
    PERDIDO = "perdido"
    NUTRICION = "nutricion"

class TipoActividadEnum:
    LLAMADA = "llamada"
    EMAIL = "email"
    REUNION = "reunion"
    TAREA = "tarea"
    NOTA = "nota"
    WHATSAPP = "whatsapp"

class OportunidadBase(BaseModel):
    nombre_cliente: str
    email_cliente: EmailStr
    organizacion: Optional[str] = None
    arquetipo_niif: str
    prioridad: str
    scoring_urgencia: int = Field(ge=0, le=100)
    scoring_madurez: int = Field(ge=0, le=100)
    scoring_capacidad: int = Field(ge=0, le=100)
    scoring_total: int = Field(ge=0, le=100)
    etapa_pipeline: str = EtapaPipelineEnum.NUEVO_LEAD
    valor_estimado_usd: float = 0.0
    probabilidad_cierre: int = Field(default=10, ge=0, le=100)
    fecha_estimada_cierre: Optional[date] = None
    proxima_accion: Optional[str] = None
    notas: Optional[str] = None
    estado: str = EstadoOportunidadEnum.ACTIVO

class OportunidadCreate(OportunidadBase):
    diagnostico_id: Optional[str] = None
    user_id: str

class OportunidadUpdate(BaseModel):
    etapa_pipeline: Optional[str] = None
    valor_estimado_usd: Optional[float] = None
    probabilidad_cierre: Optional[int] = None
    fecha_estimada_cierre: Optional[date] = None
    proxima_accion: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[str] = None

class Oportunidad(OportunidadBase):
    id: str
    diagnostico_id: Optional[str] = None
    user_id: str
    fecha_creacion: datetime
    ultima_actividad: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class ActividadBase(BaseModel):
    tipo: str
    titulo: str
    descripcion: Optional[str] = None
    fecha_programada: Optional[datetime] = None
    completada: bool = False
    resultado: Optional[str] = None

class ActividadCreate(ActividadBase):
    oportunidad_id: str
    creado_por: str

class ActividadUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_programada: Optional[datetime] = None
    completada: Optional[bool] = None
    fecha_completada: Optional[datetime] = None
    resultado: Optional[str] = None

class Actividad(ActividadBase):
    id: str
    oportunidad_id: str
    creado_por: str
    fecha_completada: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

# ============================================
# HELPER FUNCTIONS
# ============================================

def calcular_prioridad(urgencia: int, madurez: int, capacidad: int) -> str:
    """
    Calcula la prioridad basada en scoring
    A1-A3: Alta prioridad (seguimiento inmediato)
    B1-B3: Media prioridad (seguimiento regular)
    C1-C3: Baja prioridad (nutrición)
    """
    # Clasificar niveles
    nivel_urgencia = 'U' if urgencia >= 67 else ('M' if urgencia >= 34 else 'B')
    nivel_madurez = 'H' if madurez >= 67 else ('M' if madurez >= 34 else 'L')
    nivel_capacidad = 'H' if capacidad >= 67 else ('M' if capacidad >= 34 else 'L')
    
    # Matriz de priorización
    # A = Alta prioridad (Urgente + Alta madurez/capacidad)
    if nivel_urgencia == 'U' and (nivel_madurez == 'H' or nivel_capacidad == 'H'):
        if nivel_madurez == 'H' and nivel_capacidad == 'H':
            return 'A1'
        elif nivel_madurez == 'H' or nivel_capacidad == 'H':
            return 'A2'
        else:
            return 'A3'
    
    # B = Prioridad media
    elif nivel_urgencia == 'M' or (nivel_madurez == 'M' and nivel_capacidad == 'M'):
        if nivel_urgencia == 'M' and nivel_madurez == 'M' and nivel_capacidad == 'M':
            return 'B1'
        elif nivel_urgencia == 'M':
            return 'B2'
        else:
            return 'B3'
    
    # C = Prioridad baja (nutrición)
    else:
        if nivel_urgencia == 'B' and nivel_madurez == 'L':
            return 'C3'
        elif nivel_madurez == 'L' or nivel_capacidad == 'L':
            return 'C2'
        else:
            return 'C1'

def calcular_valor_estimado(prioridad: str, organizacion: Optional[str] = None) -> float:
    """
    Estima valor potencial basado en prioridad
    Esto es una heurística inicial que puede refinarse
    """
    base_values = {
        'A1': 50000.0,  # Cliente premium
        'A2': 35000.0,
        'A3': 25000.0,
        'B1': 15000.0,
        'B2': 10000.0,
        'B3': 7500.0,
        'C1': 5000.0,
        'C2': 3000.0,
        'C3': 1500.0,
    }
    return base_values.get(prioridad, 5000.0)

def calcular_probabilidad_inicial(prioridad: str, etapa: str) -> int:
    """
    Calcula probabilidad inicial de cierre
    """
    # Probabilidad base por prioridad
    prob_base = {
        'A1': 60, 'A2': 50, 'A3': 40,
        'B1': 30, 'B2': 25, 'B3': 20,
        'C1': 15, 'C2': 10, 'C3': 5
    }
    
    # Ajuste por etapa
    ajustes_etapa = {
        'nuevo_lead': 1.0,
        'calificado': 1.2,
        'contacto_inicial': 1.3,
        'diagnostico_profundo': 1.5,
        'consultoria_activa': 1.7,
        'preparando_solucion': 1.8,
        'negociacion': 1.9,
    }
    
    prob = prob_base.get(prioridad, 10) * ajustes_etapa.get(etapa, 1.0)
    return min(int(prob), 95)  # Max 95% hasta que se cierre

# ============================================
# CRUD OPERATIONS - OPORTUNIDADES
# ============================================

async def guardar_diagnostico_supabase(diagnostico_data: dict) -> Optional[dict]:
    """
    Guarda diagnóstico en Supabase (tabla diagnosticos)
    """
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/diagnosticos",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=diagnostico_data,
            timeout=10
        )
        
        if response.status_code == 201:
            return response.json()[0]
        else:
            print(f"Error saving diagnostico to Supabase: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error in guardar_diagnostico_supabase: {e}")
        return None

async def crear_oportunidad_desde_diagnostico(diagnostico: dict, user: dict) -> Optional[dict]:
    """
    Crea una oportunidad automáticamente cuando se completa un diagnóstico
    """
    try:
        # Calcular prioridad
        prioridad = calcular_prioridad(
            diagnostico['scoring']['urgencia']['puntos'],
            diagnostico['scoring']['madurez']['puntos'],
            diagnostico['scoring']['capacidad']['puntos']
        )
        
        # Preparar datos de oportunidad
        oportunidad_data = {
            'diagnostico_id': diagnostico['id'],
            'user_id': user['id'],
            'nombre_cliente': user.get('nombre_completo', user['email']),
            'email_cliente': user['email'],
            'organizacion': diagnostico['empresa'],
            'arquetipo_niif': diagnostico['arquetipo']['codigo'],
            'prioridad': prioridad,
            'scoring_urgencia': diagnostico['scoring']['urgencia']['puntos'],
            'scoring_madurez': diagnostico['scoring']['madurez']['puntos'],
            'scoring_capacidad': diagnostico['scoring']['capacidad']['puntos'],
            'scoring_total': diagnostico['scoring_total'],
            'etapa_pipeline': EtapaPipelineEnum.NUEVO_LEAD,
            'valor_estimado_usd': calcular_valor_estimado(prioridad, diagnostico['empresa']),
            'probabilidad_cierre': calcular_probabilidad_inicial(prioridad, EtapaPipelineEnum.NUEVO_LEAD),
            'estado': EstadoOportunidadEnum.ACTIVO,
            'notas': f"Oportunidad generada automáticamente desde diagnóstico. Arquetipo: {diagnostico['arquetipo']['nombre']}"
        }
        
        # Crear en Supabase
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/oportunidades",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=oportunidad_data,
            timeout=10
        )
        
        if response.status_code == 201:
            return response.json()[0]
        else:
            print(f"Error creating oportunidad: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error in crear_oportunidad_desde_diagnostico: {e}")
        return None

async def get_oportunidades(
    prioridad: Optional[str] = None,
    etapa: Optional[str] = None,
    estado: Optional[str] = None
) -> List[dict]:
    """Obtiene lista de oportunidades con filtros opcionales"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/oportunidades?order=fecha_creacion.desc"
        
        if prioridad:
            url += f"&prioridad=eq.{prioridad}"
        if etapa:
            url += f"&etapa_pipeline=eq.{etapa}"
        if estado:
            url += f"&estado=eq.{estado}"
        
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
        print(f"Error in get_oportunidades: {e}")
        return []

async def get_oportunidad_by_id(oportunidad_id: str) -> Optional[dict]:
    """Obtiene una oportunidad por ID"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/oportunidades?id=eq.{oportunidad_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            oportunidades = response.json()
            return oportunidades[0] if oportunidades else None
        return None
        
    except Exception as e:
        print(f"Error in get_oportunidad_by_id: {e}")
        return None

async def update_oportunidad(oportunidad_id: str, update_data: dict) -> Optional[dict]:
    """Actualiza una oportunidad"""
    try:
        # Agregar timestamp de última actividad
        update_data['ultima_actividad'] = datetime.utcnow().isoformat()
        
        # Convertir objetos date a string ISO
        if 'fecha_estimada_cierre' in update_data and update_data['fecha_estimada_cierre']:
            if isinstance(update_data['fecha_estimada_cierre'], date):
                update_data['fecha_estimada_cierre'] = update_data['fecha_estimada_cierre'].isoformat()
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/oportunidades?id=eq.{oportunidad_id}",
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
            result = response.json()
            return result[0] if result else None
        return None
        
    except Exception as e:
        print(f"Error in update_oportunidad: {e}")
        return None

# ============================================
# CRUD OPERATIONS - ACTIVIDADES
# ============================================

async def crear_actividad(actividad_data: dict) -> Optional[dict]:
    """Crea una nueva actividad"""
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/actividades",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=actividad_data,
            timeout=10
        )
        
        if response.status_code == 201:
            actividad = response.json()[0]
            # Actualizar última actividad en oportunidad
            await update_oportunidad(
                actividad_data['oportunidad_id'],
                {'ultima_actividad': datetime.utcnow().isoformat()}
            )
            return actividad
        return None
        
    except Exception as e:
        print(f"Error in crear_actividad: {e}")
        return None

async def get_actividades_by_oportunidad(oportunidad_id: str) -> List[dict]:
    """Obtiene todas las actividades de una oportunidad"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/actividades?oportunidad_id=eq.{oportunidad_id}&order=created_at.desc",
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
        print(f"Error in get_actividades_by_oportunidad: {e}")
        return []

async def update_actividad(actividad_id: str, update_data: dict) -> Optional[dict]:
    """Actualiza una actividad"""
    try:
        # Si se marca como completada, agregar timestamp
        if update_data.get('completada') and 'fecha_completada' not in update_data:
            update_data['fecha_completada'] = datetime.utcnow().isoformat()
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/actividades?id=eq.{actividad_id}",
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
            result = response.json()
            return result[0] if result else None
        return None
        
    except Exception as e:
        print(f"Error in update_actividad: {e}")
        return None

# ============================================
# ANALYTICS Y REPORTES
# ============================================

async def get_pipeline_stats() -> dict:
    """Obtiene estadísticas del pipeline"""
    try:
        oportunidades = await get_oportunidades(estado=EstadoOportunidadEnum.ACTIVO)
        
        # Contar por etapa
        stats_por_etapa = {}
        valor_por_etapa = {}
        
        for opp in oportunidades:
            etapa = opp['etapa_pipeline']
            stats_por_etapa[etapa] = stats_por_etapa.get(etapa, 0) + 1
            valor_por_etapa[etapa] = valor_por_etapa.get(etapa, 0) + opp['valor_estimado_usd']
        
        # Contar por prioridad
        stats_por_prioridad = {}
        for opp in oportunidades:
            prioridad = opp['prioridad']
            stats_por_prioridad[prioridad] = stats_por_prioridad.get(prioridad, 0) + 1
        
        # Valor total del pipeline
        valor_total = sum(opp['valor_estimado_usd'] for opp in oportunidades)
        valor_ponderado = sum(
            opp['valor_estimado_usd'] * (opp['probabilidad_cierre'] / 100)
            for opp in oportunidades
        )
        
        return {
            'total_oportunidades': len(oportunidades),
            'valor_total_pipeline_usd': round(valor_total, 2),
            'valor_ponderado_usd': round(valor_ponderado, 2),
            'por_etapa': stats_por_etapa,
            'valor_por_etapa': {k: round(v, 2) for k, v in valor_por_etapa.items()},
            'por_prioridad': stats_por_prioridad
        }
        
    except Exception as e:
        print(f"Error in get_pipeline_stats: {e}")
        return {}
