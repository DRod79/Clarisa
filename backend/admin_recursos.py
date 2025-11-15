"""
Admin Recursos API
CRUD completo para gestión de recursos desde el panel de admin
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import requests
import uuid
from storage_client import storage_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Configuración Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# ============================================
# MODELOS
# ============================================

class RecursoCreate(BaseModel):
    titulo: str
    descripcion: str
    tipo: str  # guia, template, video, articulo, herramienta, caso_estudio
    categoria: str
    contenido: Optional[str] = None
    url_externo: Optional[str] = None
    archivo_url: Optional[str] = None
    autor: Optional[str] = None
    duracion_minutos: Optional[int] = None
    nivel_dificultad: Optional[str] = 'basico'  # basico, intermedio, avanzado
    tags: List[str] = []
    acceso_requerido: str = 'gratuito'  # gratuito, pagado, todos
    fase_relacionada: Optional[int] = None
    publicado: bool = True
    destacado: bool = False

class RecursoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    categoria: Optional[str] = None
    contenido: Optional[str] = None
    url_externo: Optional[str] = None
    archivo_url: Optional[str] = None
    autor: Optional[str] = None
    duracion_minutos: Optional[int] = None
    nivel_dificultad: Optional[str] = None
    tags: Optional[List[str]] = None
    acceso_requerido: Optional[str] = None
    fase_relacionada: Optional[int] = None
    publicado: Optional[bool] = None
    destacado: Optional[bool] = None

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
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, params=params, timeout=10)
        
        response.raise_for_status()
        
        if method == 'DELETE':
            return {"success": True}
        
        return response.json()
    except Exception as e:
        logger.error(f"Supabase request error: {e}")
        return None

# ============================================
# ENDPOINTS - CRUD RECURSOS
# ============================================

@router.get("/admin/recursos")
async def listar_recursos_admin(
    page: int = 1,
    limit: int = 50,
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
    fase: Optional[int] = None,
    publicado: Optional[bool] = None,
    search: Optional[str] = None
):
    """
    Lista todos los recursos con filtros y paginación (solo admin)
    """
    try:
        # Construir query params
        params = {
            'order': 'created_at.desc',
            'limit': limit,
            'offset': (page - 1) * limit
        }
        
        if tipo:
            params['tipo'] = f'eq.{tipo}'
        if categoria:
            params['categoria'] = f'eq.{categoria}'
        if fase is not None:
            params['fase_relacionada'] = f'eq.{fase}'
        if publicado is not None:
            params['publicado'] = f'eq.{publicado}'
        if search:
            params['titulo'] = f'ilike.*{search}*'
        
        # Obtener recursos
        recursos = supabase_request('GET', 'recursos', params=params)
        
        if recursos is None:
            raise HTTPException(status_code=500, detail="Error al obtener recursos")
        
        # Contar total
        count_params = {'select': 'count'}
        if tipo:
            count_params['tipo'] = f'eq.{tipo}'
        if categoria:
            count_params['categoria'] = f'eq.{categoria}'
        if fase is not None:
            count_params['fase_relacionada'] = f'eq.{fase}'
        if publicado is not None:
            count_params['publicado'] = f'eq.{publicado}'
        
        return {
            "recursos": recursos,
            "total": len(recursos),  # Simplificado
            "page": page,
            "limit": limit
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listando recursos: {e}")
        raise HTTPException(status_code=500, detail="Error al listar recursos")


@router.get("/admin/recursos/{recurso_id}")
async def obtener_recurso_admin(recurso_id: str):
    """Obtiene un recurso específico con todos los detalles"""
    try:
        recursos = supabase_request('GET', 'recursos', params={'id': f'eq.{recurso_id}'})
        
        if not recursos or len(recursos) == 0:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
        
        return recursos[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo recurso: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener recurso")


@router.post("/admin/recursos")
async def crear_recurso_admin(recurso: RecursoCreate):
    """Crea un nuevo recurso"""
    try:
        # Preparar datos
        recurso_data = recurso.dict()
        
        # Crear recurso
        response = supabase_request('POST', 'recursos', data=recurso_data)
        
        if not response:
            raise HTTPException(status_code=500, detail="Error al crear recurso")
        
        logger.info(f"Recurso creado: {response[0]['id']}")
        return response[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando recurso: {e}")
        raise HTTPException(status_code=500, detail="Error al crear recurso")


@router.patch("/admin/recursos/{recurso_id}")
async def actualizar_recurso_admin(recurso_id: str, recurso: RecursoUpdate):
    """Actualiza un recurso existente"""
    try:
        # Verificar que existe
        existe = supabase_request('GET', 'recursos', params={'id': f'eq.{recurso_id}'})
        if not existe or len(existe) == 0:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
        
        # Preparar datos (solo campos no nulos)
        update_data = {k: v for k, v in recurso.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        
        # Actualizar
        response = supabase_request('PATCH', f'recursos?id=eq.{recurso_id}', data=update_data)
        
        if not response:
            raise HTTPException(status_code=500, detail="Error al actualizar recurso")
        
        logger.info(f"Recurso actualizado: {recurso_id}")
        return response[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando recurso: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar recurso")


@router.delete("/admin/recursos/{recurso_id}")
async def eliminar_recurso_admin(recurso_id: str):
    """Elimina un recurso y su archivo asociado si existe"""
    try:
        # Obtener recurso para ver si tiene archivo
        recurso = supabase_request('GET', 'recursos', params={'id': f'eq.{recurso_id}'})
        
        if not recurso or len(recurso) == 0:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
        
        # Eliminar archivo si existe
        if recurso[0].get('archivo_url'):
            try:
                # Extraer path del archivo de la URL
                archivo_url = recurso[0]['archivo_url']
                # Formato típico: https://xxx.supabase.co/storage/v1/object/public/bucket/path
                if '/public/' in archivo_url:
                    file_path = archivo_url.split('/public/')[-1]
                    storage_client.delete_file(file_path)
                    logger.info(f"Archivo eliminado: {file_path}")
            except Exception as e:
                logger.warning(f"Error eliminando archivo: {e}")
        
        # Eliminar recurso de la base de datos
        response = supabase_request('DELETE', f'recursos?id=eq.{recurso_id}')
        
        logger.info(f"Recurso eliminado: {recurso_id}")
        return {"success": True, "message": "Recurso eliminado correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando recurso: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar recurso")


# ============================================
# ENDPOINTS - SUBIDA DE ARCHIVOS
# ============================================

@router.post("/admin/recursos/upload-file")
async def subir_archivo_recurso(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("recursos")
):
    """
    Sube un archivo al storage de Supabase
    """
    try:
        # Validar archivo
        if not file.filename:
            raise HTTPException(status_code=400, detail="El archivo debe tener un nombre")
        
        # Leer contenido
        content = await file.read()
        
        # Validar tamaño (50MB max)
        if len(content) > 52428800:
            raise HTTPException(status_code=413, detail="El archivo excede el límite de 50MB")
        
        # Validar tipo de archivo
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'mov']
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=415,
                detail=f"Tipo de archivo no permitido. Permitidos: {', '.join(allowed_extensions)}"
            )
        
        # Generar nombre único
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"{folder}/{unique_filename}"
        
        # Subir a Supabase Storage
        result = storage_client.upload_file(
            file_path=file_path,
            file_content=content,
            content_type=file.content_type
        )
        
        return {
            "success": True,
            "filename": file.filename,
            "file_path": file_path,
            "url": result['url'],
            "size": len(content)
        }
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Error subiendo archivo: {e}")
        raise HTTPException(status_code=500, detail="Error al subir archivo")
    finally:
        await file.close()


@router.delete("/admin/recursos/delete-file")
async def eliminar_archivo_storage(file_path: str):
    """Elimina un archivo del storage"""
    try:
        storage_client.delete_file(file_path)
        return {"success": True, "message": "Archivo eliminado correctamente"}
    except Exception as e:
        logger.error(f"Error eliminando archivo: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar archivo")


# ============================================
# ENDPOINTS - ESTADÍSTICAS ADMIN
# ============================================

@router.get("/admin/recursos/stats/resumen")
async def obtener_estadisticas_recursos():
    """Obtiene estadísticas generales de recursos"""
    try:
        # Total de recursos
        todos = supabase_request('GET', 'recursos', params={'select': 'id'})
        total_recursos = len(todos) if todos else 0
        
        # Por tipo
        stats_tipo = {}
        for tipo in ['guia', 'template', 'video', 'articulo', 'herramienta', 'caso_estudio']:
            recursos_tipo = supabase_request('GET', 'recursos', params={'tipo': f'eq.{tipo}', 'select': 'id'})
            stats_tipo[tipo] = len(recursos_tipo) if recursos_tipo else 0
        
        # Por fase
        stats_fase = {}
        for fase in [1, 2, 3, 4, 5]:
            recursos_fase = supabase_request('GET', 'recursos', params={'fase_relacionada': f'eq.{fase}', 'select': 'id'})
            stats_fase[f'fase_{fase}'] = len(recursos_fase) if recursos_fase else 0
        
        # Publicados vs borradores
        publicados = supabase_request('GET', 'recursos', params={'publicado': 'eq.true', 'select': 'id'})
        borradores = supabase_request('GET', 'recursos', params={'publicado': 'eq.false', 'select': 'id'})
        
        # Destacados
        destacados = supabase_request('GET', 'recursos', params={'destacado': 'eq.true', 'select': 'id'})
        
        return {
            "total_recursos": total_recursos,
            "publicados": len(publicados) if publicados else 0,
            "borradores": len(borradores) if borradores else 0,
            "destacados": len(destacados) if destacados else 0,
            "por_tipo": stats_tipo,
            "por_fase": stats_fase
        }
    
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener estadísticas")


@router.get("/admin/recursos/stats/populares")
async def obtener_recursos_populares(limit: int = 10):
    """Obtiene los recursos más vistos/descargados"""
    try:
        # Recursos más vistos
        mas_vistos = supabase_request(
            'GET',
            'recursos',
            params={'order': 'vistas.desc', 'limit': limit, 'select': 'id,titulo,vistas,tipo'}
        )
        
        # Recursos más descargados
        mas_descargados = supabase_request(
            'GET',
            'recursos',
            params={'order': 'descargas.desc', 'limit': limit, 'select': 'id,titulo,descargas,tipo'}
        )
        
        return {
            "mas_vistos": mas_vistos or [],
            "mas_descargados": mas_descargados or []
        }
    
    except Exception as e:
        logger.error(f"Error obteniendo recursos populares: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener recursos populares")
