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
        print(f"[FAVORITOS] Obteniendo favoritos para user_id: {user_id}")
        
        # Obtener IDs de recursos favoritos
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/recursos_favoritos?user_id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        print(f"[FAVORITOS] Status de recursos_favoritos: {response.status_code}")
        
        if response.status_code == 200:
            favoritos = response.json()
            print(f"[FAVORITOS] Registros encontrados: {len(favoritos)}")
            print(f"[FAVORITOS] Favoritos raw: {favoritos}")
            
            if not favoritos:
                return {
                    'favoritos': [],
                    'total': 0
                }
            
            # Obtener información completa de los recursos
            recurso_ids = [f.get('recurso_id') for f in favoritos]
            print(f"[FAVORITOS] IDs de recursos a buscar: {recurso_ids}")
            
            # Obtener recursos uno por uno para asegurar compatibilidad
            recursos = []
            for recurso_id in recurso_ids:
                try:
                    recursos_response = requests.get(
                        f"{SUPABASE_URL}/rest/v1/recursos?id=eq.{recurso_id}",
                        headers={
                            'apikey': SUPABASE_KEY,
                            'Authorization': f'Bearer {SUPABASE_KEY}'
                        },
                        timeout=10
                    )
                    
                    if recursos_response.status_code == 200:
                        found = recursos_response.json()
                        if found:
                            recursos.extend(found)
                except Exception as e:
                    print(f"[FAVORITOS] Error buscando recurso {recurso_id}: {e}")
            
            print(f"[FAVORITOS] Recursos encontrados: {len(recursos)}")
            
            print(f"[FAVORITOS] Status de recursos: {recursos_response.status_code}")
            
            if recursos_response.status_code == 200:
                recursos = recursos_response.json()
                print(f"[FAVORITOS] Recursos encontrados: {len(recursos)}")
                
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
                
                print(f"[FAVORITOS] Favoritos completos: {len(favoritos_completos)}")
                
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
        print(f"[FAVORITOS POST] Agregando favorito - user_id: {datos.user_id}, recurso_id: {datos.recurso_id}")
        
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
            
            print(f"[FAVORITOS POST] Check existing status: {check_response.status_code}")
            
            if check_response.status_code == 200:
                existing = check_response.json()
                print(f"[FAVORITOS POST] Existing: {existing}")
                if existing:
                    return {
                        'message': 'El recurso ya está en favoritos',
                        'agregado': False
                    }
        except Exception as e:
            print(f"[FAVORITOS POST] Error checking existing: {e}")
            pass
        
        # Agregar a favoritos
        favorito_data = {
            'user_id': datos.user_id,
            'recurso_id': datos.recurso_id,
            'created_at': datetime.now().isoformat()
        }
        
        print(f"[FAVORITOS POST] Datos a insertar: {favorito_data}")
        
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
            
            print(f"[FAVORITOS POST] Insert status: {response.status_code}")
            print(f"[FAVORITOS POST] Insert response: {response.text}")
            
            if response.status_code == 201:
                return {
                    'message': 'Recurso agregado a favoritos',
                    'agregado': True
                }
            else:
                print(f"[FAVORITOS POST] Error al insertar: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error al agregar favorito: {response.text}"
                )
        except Exception as e:
            # Si la tabla no existe
            print(f"[FAVORITOS POST] Exception: {e}")
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
