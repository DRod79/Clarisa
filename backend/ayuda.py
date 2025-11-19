"""
Centro de Ayuda API
Endpoints para FAQs y sistema de soporte
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import requests

router = APIRouter()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# ============================================
# MODELOS
# ============================================

class CategoriaFAQResponse(BaseModel):
    id: str
    nombre: str
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    orden: int
    faqs_count: int = 0

class FAQResponse(BaseModel):
    id: str
    categoria_id: str
    pregunta: str
    respuesta: str
    orden: int
    vistas: int
    util_si: int
    util_no: int

class TicketCreate(BaseModel):
    asunto: str
    categoria: str
    descripcion: str
    prioridad: str = 'normal'

class TicketMensajeCreate(BaseModel):
    mensaje: str

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
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error en petición Supabase: {e}")
        return None

# ============================================
# ENDPOINTS - FAQs
# ============================================

@router.get("/ayuda/categorias")
async def obtener_categorias_faq():
    """Obtiene todas las categorías de FAQs activas"""
    try:
        categorias = supabase_request(
            'GET',
            'faq_categorias',
            params={'activa': 'eq.true', 'order': 'orden.asc'}
        )
        
        if categorias is None:
            raise HTTPException(status_code=500, detail="Error al obtener categorías")
        
        # Contar FAQs por categoría
        for cat in categorias:
            faqs = supabase_request(
                'GET',
                'faqs',
                params={'categoria_id': f"eq.{cat['id']}", 'visible': 'eq.true', 'select': 'id'}
            )
            cat['faqs_count'] = len(faqs) if faqs else 0
        
        return categorias
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo categorías: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener categorías")


@router.get("/ayuda/faqs")
async def obtener_faqs(categoria_id: Optional[str] = None, search: Optional[str] = None):
    """Obtiene FAQs, opcionalmente filtradas por categoría o búsqueda"""
    try:
        params = {'visible': 'eq.true', 'order': 'orden.asc'}
        
        if categoria_id:
            params['categoria_id'] = f'eq.{categoria_id}'
        
        if search:
            params['or'] = f'(pregunta.ilike.*{search}*,respuesta.ilike.*{search}*)'
        
        faqs = supabase_request('GET', 'faqs', params=params)
        
        if faqs is None:
            raise HTTPException(status_code=500, detail="Error al obtener FAQs")
        
        return faqs
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo FAQs: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener FAQs")


@router.post("/ayuda/faqs/{faq_id}/registrar-vista")
async def registrar_vista_faq(faq_id: str):
    """Incrementa el contador de vistas de un FAQ"""
    try:
        # Obtener FAQ actual
        faq = supabase_request('GET', 'faqs', params={'id': f'eq.{faq_id}'})
        
        if not faq or len(faq) == 0:
            raise HTTPException(status_code=404, detail="FAQ no encontrado")
        
        # Incrementar vistas
        vistas_actuales = faq[0].get('vistas', 0)
        supabase_request(
            'PATCH',
            f'faqs?id=eq.{faq_id}',
            data={'vistas': vistas_actuales + 1}
        )
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error registrando vista: {e}")
        raise HTTPException(status_code=500, detail="Error al registrar vista")


@router.post("/ayuda/faqs/{faq_id}/valorar")
async def valorar_faq(faq_id: str, util: bool):
    """Registra si un FAQ fue útil o no"""
    try:
        # Obtener FAQ actual
        faq = supabase_request('GET', 'faqs', params={'id': f'eq.{faq_id}'})
        
        if not faq or len(faq) == 0:
            raise HTTPException(status_code=404, detail="FAQ no encontrado")
        
        # Incrementar contador correspondiente
        campo = 'util_si' if util else 'util_no'
        valor_actual = faq[0].get(campo, 0)
        
        supabase_request(
            'PATCH',
            f'faqs?id=eq.{faq_id}',
            data={campo: valor_actual + 1}
        )
        
        return {"success": True}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error valorando FAQ: {e}")
        raise HTTPException(status_code=500, detail="Error al valorar FAQ")


# ============================================
# ENDPOINTS - TICKETS DE SOPORTE
# ============================================

@router.post("/soporte/tickets")
async def crear_ticket(user_id: str, ticket: TicketCreate):
    """Crea un nuevo ticket de soporte"""
    try:
        ticket_data = {
            'user_id': user_id,
            'asunto': ticket.asunto,
            'categoria': ticket.categoria,
            'descripcion': ticket.descripcion,
            'prioridad': ticket.prioridad,
            'estado': 'abierto'
        }
        
        response = supabase_request('POST', 'tickets_soporte', data=ticket_data)
        
        if not response:
            raise HTTPException(status_code=500, detail="Error al crear ticket")
        
        # Crear notificación para el usuario
        supabase_request('POST', 'notificaciones', data={
            'user_id': user_id,
            'tipo': 'ticket_creado',
            'titulo': 'Ticket de soporte creado',
            'mensaje': f'Tu ticket "{ticket.asunto}" ha sido creado y será atendido pronto.',
            'link': f'/app/soporte/tickets/{response[0]["id"]}'
        })
        
        return response[0]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creando ticket: {e}")
        raise HTTPException(status_code=500, detail="Error al crear ticket")


@router.get("/soporte/tickets")
async def obtener_tickets(user_id: str, estado: Optional[str] = None):
    """Obtiene los tickets del usuario"""
    try:
        params = {'user_id': f'eq.{user_id}', 'order': 'created_at.desc'}
        
        if estado:
            params['estado'] = f'eq.{estado}'
        
        tickets = supabase_request('GET', 'tickets_soporte', params=params)
        
        if tickets is None:
            raise HTTPException(status_code=500, detail="Error al obtener tickets")
        
        # Contar mensajes por ticket
        for ticket in tickets:
            mensajes = supabase_request(
                'GET',
                'tickets_mensajes',
                params={'ticket_id': f"eq.{ticket['id']}", 'select': 'id'}
            )
            ticket['mensajes_count'] = len(mensajes) if mensajes else 0
        
        return tickets
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo tickets: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener tickets")


@router.get("/soporte/tickets/{ticket_id}")
async def obtener_ticket_detalle(ticket_id: str, user_id: str):
    """Obtiene el detalle de un ticket con sus mensajes"""
    try:
        # Obtener ticket
        ticket = supabase_request('GET', 'tickets_soporte', params={'id': f'eq.{ticket_id}'})
        
        if not ticket or len(ticket) == 0:
            raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
        # Verificar que el ticket pertenece al usuario
        if ticket[0]['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este ticket")
        
        # Obtener mensajes
        mensajes = supabase_request(
            'GET',
            'tickets_mensajes',
            params={'ticket_id': f'eq.{ticket_id}', 'order': 'created_at.asc'}
        )
        
        ticket[0]['mensajes'] = mensajes if mensajes else []
        
        return ticket[0]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo ticket: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener ticket")


@router.post("/soporte/tickets/{ticket_id}/mensajes")
async def crear_mensaje_ticket(ticket_id: str, user_id: str, mensaje: TicketMensajeCreate):
    """Crea un nuevo mensaje en un ticket"""
    try:
        # Verificar que el ticket existe y pertenece al usuario
        ticket = supabase_request('GET', 'tickets_soporte', params={'id': f'eq.{ticket_id}'})
        
        if not ticket or len(ticket) == 0:
            raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
        if ticket[0]['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="No tienes acceso a este ticket")
        
        # Crear mensaje
        mensaje_data = {
            'ticket_id': ticket_id,
            'user_id': user_id,
            'mensaje': mensaje.mensaje,
            'es_staff': False
        }
        
        response = supabase_request('POST', 'tickets_mensajes', data=mensaje_data)
        
        if not response:
            raise HTTPException(status_code=500, detail="Error al crear mensaje")
        
        # Actualizar timestamp del ticket
        supabase_request(
            'PATCH',
            f'tickets_soporte?id=eq.{ticket_id}',
            data={'updated_at': datetime.utcnow().isoformat()}
        )
        
        return response[0]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creando mensaje: {e}")
        raise HTTPException(status_code=500, detail="Error al crear mensaje")
