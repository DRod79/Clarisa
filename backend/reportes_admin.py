"""
API endpoints para generación y exportación de reportes avanzados
Permite exportar datos a CSV y generar reportes personalizados
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import requests
import os
import csv
import io
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')


def generar_csv(datos, columnas):
    """
    Genera un archivo CSV en memoria a partir de datos
    """
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=columnas)
    writer.writeheader()
    
    for item in datos:
        # Filtrar solo las columnas especificadas
        fila = {col: item.get(col, '') for col in columnas}
        writer.writerow(fila)
    
    output.seek(0)
    return output.getvalue()


@router.get("/admin/reportes/usuarios/export")
async def exportar_usuarios(
    rol: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    formato: str = Query("csv", regex="^(csv|json)$")
):
    """
    Exporta la lista de usuarios a CSV con filtros opcionales
    """
    try:
        # Construir query
        params = []
        
        if rol:
            params.append(f"rol=eq.{rol}")
        
        if plan:
            params.append(f"plan_actual=eq.{plan}")
        
        if fecha_desde:
            params.append(f"created_at=gte.{fecha_desde}")
        
        if fecha_hasta:
            # Agregar un día para incluir todo el día hasta
            fecha_hasta_dt = datetime.fromisoformat(fecha_hasta.replace('Z', '')) + timedelta(days=1)
            params.append(f"created_at=lt.{fecha_hasta_dt.isoformat()}")
        
        query_string = "&".join(params) if params else ""
        url = f"{SUPABASE_URL}/rest/v1/users?{query_string}&order=created_at.desc"
        
        response = requests.get(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            usuarios = response.json()
            
            # Definir columnas para el CSV
            columnas = [
                'id', 'email', 'nombre_completo', 'organizacion', 'rol', 
                'plan_actual', 'suscripcion_activa', 'pais', 'puesto',
                'fecha_registro', 'ultimo_acceso', 'progreso_general'
            ]
            
            # Generar CSV
            csv_content = generar_csv(usuarios, columnas)
            
            # Crear nombre de archivo
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"usuarios_{timestamp}.csv"
            
            # Retornar como descarga
            return StreamingResponse(
                iter([csv_content]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener usuarios: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reportes/recursos/export")
async def exportar_recursos(
    tipo: Optional[str] = Query(None),
    fase: Optional[int] = Query(None),
    acceso: Optional[str] = Query(None),
    formato: str = Query("csv", regex="^(csv)$")
):
    """
    Exporta la lista de recursos a CSV con filtros opcionales
    """
    try:
        # Construir query
        params = []
        
        if tipo:
            params.append(f"tipo=eq.{tipo}")
        
        if fase:
            params.append(f"fase=eq.{fase}")
        
        if acceso:
            params.append(f"acceso=eq.{acceso}")
        
        query_string = "&".join(params) if params else ""
        url = f"{SUPABASE_URL}/rest/v1/recursos?{query_string}&order=created_at.desc"
        
        response = requests.get(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            recursos = response.json()
            
            # Definir columnas para el CSV
            columnas = [
                'id', 'titulo', 'descripcion', 'tipo', 'fase', 'acceso',
                'url_contenido', 'vistas', 'descargas', 'created_at', 'updated_at'
            ]
            
            # Generar CSV
            csv_content = generar_csv(recursos, columnas)
            
            # Crear nombre de archivo
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"recursos_{timestamp}.csv"
            
            # Retornar como descarga
            return StreamingResponse(
                iter([csv_content]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener recursos: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reportes/tickets/export")
async def exportar_tickets(
    estado: Optional[str] = Query(None),
    prioridad: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    formato: str = Query("csv", regex="^(csv)$")
):
    """
    Exporta la lista de tickets de soporte a CSV con filtros opcionales
    """
    try:
        # Construir query
        params = []
        
        if estado:
            params.append(f"estado=eq.{estado}")
        
        if prioridad:
            params.append(f"prioridad=eq.{prioridad}")
        
        if categoria:
            params.append(f"categoria=eq.{categoria}")
        
        if fecha_desde:
            params.append(f"created_at=gte.{fecha_desde}")
        
        if fecha_hasta:
            fecha_hasta_dt = datetime.fromisoformat(fecha_hasta.replace('Z', '')) + timedelta(days=1)
            params.append(f"created_at=lt.{fecha_hasta_dt.isoformat()}")
        
        query_string = "&".join(params) if params else ""
        url = f"{SUPABASE_URL}/rest/v1/tickets?{query_string}&order=created_at.desc"
        
        response = requests.get(
            url,
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            tickets = response.json()
            
            # Definir columnas para el CSV
            columnas = [
                'id', 'user_id', 'asunto', 'categoria', 'estado', 'prioridad',
                'created_at', 'updated_at', 'cerrado_at'
            ]
            
            # Generar CSV
            csv_content = generar_csv(tickets, columnas)
            
            # Crear nombre de archivo
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"tickets_{timestamp}.csv"
            
            # Retornar como descarga
            return StreamingResponse(
                iter([csv_content]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener tickets: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reportes/actividad")
async def obtener_actividad_detallada(
    tipo: Optional[str] = Query(None, description="usuarios, diagnosticos, tickets, recursos"),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    agrupar_por: str = Query("dia", regex="^(dia|semana|mes)$")
):
    """
    Obtiene datos de actividad agrupados por período
    Útil para generar gráficos de tendencias
    """
    try:
        # Por ahora retornar estructura básica
        # En producción, aquí se harían queries más complejas con agregaciones
        
        fecha_desde_dt = datetime.fromisoformat(fecha_desde.replace('Z', '')) if fecha_desde else datetime.now() - timedelta(days=30)
        fecha_hasta_dt = datetime.fromisoformat(fecha_hasta.replace('Z', '')) if fecha_hasta else datetime.now()
        
        actividad = {
            'periodo': {
                'desde': fecha_desde_dt.isoformat(),
                'hasta': fecha_hasta_dt.isoformat(),
                'agrupar_por': agrupar_por
            },
            'datos': []
        }
        
        # Generar datos de ejemplo agrupados por día
        # En producción, esto vendría de queries reales a la BD
        dias = (fecha_hasta_dt - fecha_desde_dt).days
        
        for i in range(dias + 1):
            fecha = fecha_desde_dt + timedelta(days=i)
            actividad['datos'].append({
                'fecha': fecha.strftime('%Y-%m-%d'),
                'nuevos_usuarios': 0,
                'diagnosticos': 0,
                'tickets': 0,
                'recursos_vistos': 0
            })
        
        # Obtener datos reales para el período
        if tipo == 'usuarios' or not tipo:
            # Contar usuarios por día
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/users?created_at=gte.{fecha_desde_dt.isoformat()}&created_at=lt.{fecha_hasta_dt.isoformat()}&select=created_at",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                usuarios = response.json()
                for usuario in usuarios:
                    fecha_str = usuario['created_at'][:10]
                    for dato in actividad['datos']:
                        if dato['fecha'] == fecha_str:
                            dato['nuevos_usuarios'] += 1
                            break
        
        return actividad
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reportes/resumen")
async def obtener_resumen_reportes():
    """
    Obtiene un resumen general para la página de reportes
    Incluye contadores y métricas clave
    """
    try:
        resumen = {}
        
        # Total de usuarios
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'count=exact'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            content_range = response.headers.get('Content-Range', '0-0/0')
            resumen['total_usuarios'] = int(content_range.split('/')[-1])
        else:
            resumen['total_usuarios'] = 0
        
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
            resumen['total_recursos'] = int(content_range.split('/')[-1])
        else:
            resumen['total_recursos'] = 0
        
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
            resumen['total_tickets'] = int(content_range.split('/')[-1])
        else:
            resumen['total_tickets'] = 0
        
        # Total de diagnósticos
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/diagnosticos?select=count",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'count=exact'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                content_range = response.headers.get('Content-Range', '0-0/0')
                resumen['total_diagnosticos'] = int(content_range.split('/')[-1])
            else:
                resumen['total_diagnosticos'] = 0
        except:
            resumen['total_diagnosticos'] = 0
        
        return resumen
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
