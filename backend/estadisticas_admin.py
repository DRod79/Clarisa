"""
API endpoints para estadísticas del Dashboard Admin
Proporciona métricas clave para monitoreo y análisis
"""
from fastapi import APIRouter, HTTPException
import requests
import os
from datetime import datetime, timedelta

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

@router.get("/admin/estadisticas/general")
async def get_estadisticas_generales():
    """
    Obtiene estadísticas generales del sistema
    - Total de usuarios
    - Usuarios activos (último mes)
    - Total de diagnósticos
    - Diagnósticos del último mes
    """
    try:
        stats = {}
        
        # Total de usuarios - usar la misma consulta que para roles
        response_roles = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?select=rol",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_roles.status_code == 200:
            usuarios = response_roles.json()
            stats['total_usuarios'] = len(usuarios)
            stats['usuarios_admin'] = len([u for u in usuarios if u.get('rol') == 'admin'])
            stats['usuarios_pagado'] = len([u for u in usuarios if u.get('rol') == 'cliente_pagado'])
            stats['usuarios_gratuito'] = len([u for u in usuarios if u.get('rol') == 'cliente_gratuito'])
        else:
            stats['total_usuarios'] = 0
            stats['usuarios_admin'] = 0
            stats['usuarios_pagado'] = 0
            stats['usuarios_gratuito'] = 0
        
        # Usuarios por rol
        response_roles = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?select=rol",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_roles.status_code == 200:
            usuarios = response_roles.json()
            stats['usuarios_admin'] = len([u for u in usuarios if u.get('rol') == 'admin'])
            stats['usuarios_pagado'] = len([u for u in usuarios if u.get('rol') == 'cliente_pagado'])
            stats['usuarios_gratuito'] = len([u for u in usuarios if u.get('rol') == 'cliente_gratuito'])
        else:
            stats['usuarios_admin'] = 0
            stats['usuarios_pagado'] = 0
            stats['usuarios_gratuito'] = 0
        
        # Usuarios activos (último mes)
        fecha_hace_mes = (datetime.now() - timedelta(days=30)).isoformat()
        response_activos = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?ultimo_acceso=gte.{fecha_hace_mes}&select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response_activos.status_code == 200:
            content_range = response_activos.headers.get('Content-Range', '0-0/0')
            stats['usuarios_activos_mes'] = int(content_range.split('/')[-1])
        else:
            stats['usuarios_activos_mes'] = 0
        
        # Total de diagnósticos (si la tabla existe)
        try:
            response_diag = requests.get(
                f"{SUPABASE_URL}/rest/v1/diagnosticos?select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if response_diag.status_code == 200:
                content_range = response_diag.headers.get('Content-Range', '0-0/0')
                stats['total_diagnosticos'] = int(content_range.split('/')[-1])
            else:
                stats['total_diagnosticos'] = 0
        except:
            stats['total_diagnosticos'] = 0
        
        # Diagnósticos del último mes
        try:
            response_diag_mes = requests.get(
                f"{SUPABASE_URL}/rest/v1/diagnosticos?created_at=gte.{fecha_hace_mes}&select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if response_diag_mes.status_code == 200:
                content_range = response_diag_mes.headers.get('Content-Range', '0-0/0')
                stats['diagnosticos_mes'] = int(content_range.split('/')[-1])
            else:
                stats['diagnosticos_mes'] = 0
        except:
            stats['diagnosticos_mes'] = 0
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/estadisticas/recursos")
async def get_estadisticas_recursos():
    """
    Obtiene estadísticas de recursos
    - Total de recursos
    - Recursos por tipo
    - Recursos por fase
    - Recursos más vistos
    """
    try:
        stats = {}
        
        # Total de recursos
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos?select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            content_range = response.headers.get('Content-Range', '0-0/0')
            stats['total_recursos'] = int(content_range.split('/')[-1])
        else:
            stats['total_recursos'] = 0
        
        # Recursos por tipo
        response_tipos = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos?select=tipo",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_tipos.status_code == 200:
            recursos = response_tipos.json()
            tipos = {}
            for r in recursos:
                tipo = r.get('tipo', 'Sin tipo')
                tipos[tipo] = tipos.get(tipo, 0) + 1
            stats['recursos_por_tipo'] = tipos
        else:
            stats['recursos_por_tipo'] = {}
        
        # Recursos por fase
        response_fases = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos?select=fase",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_fases.status_code == 200:
            recursos = response_fases.json()
            fases = {}
            for r in recursos:
                fase = r.get('fase', 0)
                fases[f'Fase {fase}'] = fases.get(f'Fase {fase}', 0) + 1
            stats['recursos_por_fase'] = fases
        else:
            stats['recursos_por_fase'] = {}
        
        # Recursos más vistos (top 5)
        response_vistos = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos?select=titulo,vistas&order=vistas.desc&limit=5",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_vistos.status_code == 200:
            stats['recursos_mas_vistos'] = response_vistos.json()
        else:
            stats['recursos_mas_vistos'] = []
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/estadisticas/soporte")
async def get_estadisticas_soporte():
    """
    Obtiene estadísticas de tickets de soporte
    - Total de tickets
    - Tickets por estado
    - Tickets por prioridad
    - Tiempo promedio de resolución
    """
    try:
        stats = {}
        
        # Total de tickets
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/tickets?select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            content_range = response.headers.get('Content-Range', '0-0/0')
            stats['total_tickets'] = int(content_range.split('/')[-1])
        else:
            stats['total_tickets'] = 0
        
        # Tickets por estado
        response_estados = requests.get(
            f"{SUPABASE_URL}/rest/v1/tickets?select=estado",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_estados.status_code == 200:
            tickets = response_estados.json()
            estados = {}
            for t in tickets:
                estado = t.get('estado', 'Sin estado')
                estados[estado] = estados.get(estado, 0) + 1
            stats['tickets_por_estado'] = estados
        else:
            stats['tickets_por_estado'] = {}
        
        # Tickets por prioridad
        response_prioridad = requests.get(
            f"{SUPABASE_URL}/rest/v1/tickets?select=prioridad",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response_prioridad.status_code == 200:
            tickets = response_prioridad.json()
            prioridades = {}
            for t in tickets:
                prioridad = t.get('prioridad', 'Sin prioridad')
                prioridades[prioridad] = prioridades.get(prioridad, 0) + 1
            stats['tickets_por_prioridad'] = prioridades
        else:
            stats['tickets_por_prioridad'] = {}
        
        # Tickets del último mes
        fecha_hace_mes = (datetime.now() - timedelta(days=30)).isoformat()
        response_mes = requests.get(
            f"{SUPABASE_URL}/rest/v1/tickets?created_at=gte.{fecha_hace_mes}&select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response_mes.status_code == 200:
            content_range = response_mes.headers.get('Content-Range', '0-0/0')
            stats['tickets_mes'] = int(content_range.split('/')[-1])
        else:
            stats['tickets_mes'] = 0
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/estadisticas/actividad")
async def get_estadisticas_actividad():
    """
    Obtiene estadísticas de actividad reciente
    - Nuevos usuarios (última semana)
    - Nuevos diagnósticos (última semana)
    - Tickets abiertos (última semana)
    """
    try:
        stats = {}
        fecha_hace_semana = (datetime.now() - timedelta(days=7)).isoformat()
        
        # Nuevos usuarios última semana
        response_usuarios = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?created_at=gte.{fecha_hace_semana}&select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response_usuarios.status_code == 200:
            content_range = response_usuarios.headers.get('Content-Range', '0-0/0')
            stats['nuevos_usuarios_semana'] = int(content_range.split('/')[-1])
        else:
            stats['nuevos_usuarios_semana'] = 0
        
        # Nuevos diagnósticos última semana
        try:
            response_diag = requests.get(
                f"{SUPABASE_URL}/rest/v1/diagnosticos?created_at=gte.{fecha_hace_semana}&select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if response_diag.status_code == 200:
                content_range = response_diag.headers.get('Content-Range', '0-0/0')
                stats['nuevos_diagnosticos_semana'] = int(content_range.split('/')[-1])
            else:
                stats['nuevos_diagnosticos_semana'] = 0
        except:
            stats['nuevos_diagnosticos_semana'] = 0
        
        # Nuevos tickets última semana
        response_tickets = requests.get(
            f"{SUPABASE_URL}/rest/v1/tickets?created_at=gte.{fecha_hace_semana}&select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response_tickets.status_code == 200:
            content_range = response_tickets.headers.get('Content-Range', '0-0/0')
            stats['nuevos_tickets_semana'] = int(content_range.split('/')[-1])
        else:
            stats['nuevos_tickets_semana'] = 0
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
