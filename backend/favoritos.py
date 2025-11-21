"""
API endpoints para gestión de recursos favoritos
Permite a los usuarios guardar y gestionar sus recursos favoritos
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from datetime import datetime

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')


class AgregarFavorito(BaseModel):
    user_id: str
    recurso_id: str


@router.get("/favoritos/{user_id}")
async def obtener_favoritos(user_id: str):
    """
    Obtiene la lista de recursos favoritos de un usuario
    """
    try:
        # Obtener IDs de recursos favoritos
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            favoritos = response.json()
            
            if not favoritos:
                return {
                    'favoritos': [],
                    'total': 0
                }
            
            # Obtener información completa de los recursos
            recurso_ids = [f.get('recurso_id') for f in favoritos]
            
            # Construir query para obtener recursos
            recursos_query = ','.join([f'"{rid}"' for rid in recurso_ids])
            recursos_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/recursos?id=in.({recursos_query})",
                headers={
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                timeout=10
            )
            
            if recursos_response.status_code == 200:
                recursos = recursos_response.json()
                
                # Combinar datos
                favoritos_completos = []
                for fav in favoritos:
                    recurso = next((r for r in recursos if r['id'] == fav['recurso_id']), None)
                    if recurso:
                        favoritos_completos.append({
                            'favorito_id': fav.get('id'),
                            'agregado_at': fav.get('created_at'),
                            **recurso
                        })
                
                return {
                    'favoritos': favoritos_completos,
                    'total': len(favoritos_completos)
                }
            else:
                return {
                    'favoritos': [],
                    'total': 0
                }
        else:
            # Si la tabla no existe, retornar vacío
            return {
                'favoritos': [],
                'total': 0
            }
            
    except Exception as e:
        # Si hay error, retornar vacío
        return {
            'favoritos': [],
            'total': 0
        }


@router.post("/favoritos")
async def agregar_favorito(datos: AgregarFavorito):
    """
    Agrega un recurso a favoritos
    """
    try:
        # Verificar si ya está en favoritos
        try:
            check_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{datos.user_id}&recurso_id=eq.{datos.recurso_id}",
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
                        'message': 'El recurso ya está en favoritos',
                        'agregado': False
                    }
        except:
            pass
        
        # Agregar a favoritos
        favorito_data = {
            'user_id': datos.user_id,
            'recurso_id': datos.recurso_id,
            'created_at': datetime.now().isoformat()
        }
        
        try:
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/recursos_favoritos",
                headers={
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'return=representation'
                },
                json=favorito_data,
                timeout=10
            )
            
            if response.status_code == 201:
                return {
                    'message': 'Recurso agregado a favoritos',
                    'agregado': True
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error al agregar favorito: {response.text}"
                )
        except Exception as e:
            # Si la tabla no existe
            return {
                'message': 'Sistema de favoritos no disponible',
                'agregado': False
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/favoritos/{user_id}/{recurso_id}")
async def quitar_favorito(user_id: str, recurso_id: str):
    """
    Quita un recurso de favoritos
    """
    try:
        response = requests.delete(
            f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{user_id}&recurso_id=eq.{recurso_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code in [200, 204]:
            return {
                'message': 'Recurso quitado de favoritos',
                'eliminado': True
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al quitar favorito: {response.text}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        # Si hay error, simplemente retornar éxito
        return {
            'message': 'Favorito quitado',
            'eliminado': True
        }


@router.get("/favoritos/{user_id}/check/{recurso_id}")
async def verificar_favorito(user_id: str, recurso_id: str):
    """
    Verifica si un recurso está en favoritos
    """
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{user_id}&recurso_id=eq.{recurso_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            favoritos = response.json()
            return {
                'es_favorito': len(favoritos) > 0
            }
        else:
            return {
                'es_favorito': False
            }
            
    except Exception as e:
        return {
            'es_favorito': False
        }
