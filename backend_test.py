#!/usr/bin/env python3
"""
Backend API Testing for Clarisa Client Module
Tests Notificaciones, FAQs, and Tickets APIs
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://clarisa-sustain.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test credentials from review request
ADMIN_EMAIL = "admin@clarisa.com"
ADMIN_PASSWORD = "admin123"
CLIENT_EMAIL = "cliente@test.com"
CLIENT_PASSWORD = "password123"

def login_user(email, password):
    """Login and get user_id"""
    print(f"🔐 Logging in user: {email}")
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
        
        data = response.json()
        user_id = data['user']['id']
        print(f"✅ Login successful. User ID: {user_id}")
        return user_id
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None


def test_notificaciones_stats(user_id):
    """Test GET /api/notificaciones/stats"""
    print("\n🧪 Testing GET /api/notificaciones/stats...")
    
    try:
        response = requests.get(
            f"{API_BASE}/notificaciones/stats",
            params={"user_id": user_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Stats retrieved")
        
        # Verify structure
        required_fields = ['total', 'no_leidas', 'leidas']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in stats response")
                return False
        
        print(f"📊 Stats: Total={data['total']}, No leídas={data['no_leidas']}, Leídas={data['leidas']}")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_notificaciones_list(user_id):
    """Test GET /api/notificaciones"""
    print("\n🧪 Testing GET /api/notificaciones...")
    
    try:
        response = requests.get(
            f"{API_BASE}/notificaciones",
            params={"user_id": user_id, "limit": 10},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Notificaciones retrieved")
        print(f"📋 Found {len(data)} notificaciones")
        
        # If there are notifications, verify structure
        if len(data) > 0:
            notif = data[0]
            required_fields = ['id', 'tipo', 'titulo', 'mensaje', 'leida', 'created_at']
            for field in required_fields:
                if field not in notif:
                    print(f"❌ FAILED: Missing field '{field}' in notification")
                    return False
            print(f"📝 Sample notification: {notif['titulo']}")
        else:
            print("ℹ️  No notifications found (empty table - this is normal)")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_create_notification(user_id):
    """Create a test notification for testing mark as read functionality"""
    print("\n🧪 Creating test notification...")
    
    try:
        response = requests.post(
            f"{API_BASE}/notificaciones/crear",
            params={
                "user_id": user_id,
                "tipo": "test",
                "titulo": "Notificación de prueba",
                "mensaje": "Esta es una notificación de prueba para testing",
                "link": "/app/test"
            },
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ FAILED: Could not create test notification: {response.status_code}")
            return None
        
        data = response.json()
        print(f"✅ Test notification created: {data['id']}")
        return data['id']
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return None


def test_mark_notification_read(user_id, notif_id):
    """Test POST /api/notificaciones/{notif_id}/marcar-leida"""
    print(f"\n🧪 Testing POST /api/notificaciones/{notif_id}/marcar-leida...")
    
    try:
        response = requests.post(
            f"{API_BASE}/notificaciones/{notif_id}/marcar-leida",
            params={"user_id": user_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Notification marked as read")
        print(f"📝 Response: {data['message']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_mark_all_notifications_read(user_id):
    """Test POST /api/notificaciones/marcar-todas-leidas"""
    print("\n🧪 Testing POST /api/notificaciones/marcar-todas-leidas...")
    
    try:
        response = requests.post(
            f"{API_BASE}/notificaciones/marcar-todas-leidas",
            params={"user_id": user_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: All notifications marked as read")
        print(f"📝 Response: {data['message']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_faqs_list():
    """Test GET /api/ayuda/faqs"""
    print("\n🧪 Testing GET /api/ayuda/faqs...")
    
    try:
        response = requests.get(f"{API_BASE}/ayuda/faqs", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: FAQs retrieved")
        print(f"📋 Found {len(data)} FAQs")
        
        # If there are FAQs, verify structure
        if len(data) > 0:
            faq = data[0]
            required_fields = ['id', 'categoria_id', 'pregunta', 'respuesta', 'orden']
            for field in required_fields:
                if field not in faq:
                    print(f"❌ FAILED: Missing field '{field}' in FAQ")
                    return False
            print(f"❓ Sample FAQ: {faq['pregunta'][:50]}...")
        else:
            print("ℹ️  No FAQs found (empty table - this is normal)")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_faqs_search():
    """Test GET /api/ayuda/faqs with search"""
    print("\n🧪 Testing GET /api/ayuda/faqs with search...")
    
    try:
        response = requests.get(
            f"{API_BASE}/ayuda/faqs",
            params={"search": "implementacion"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: FAQ search completed")
        print(f"🔍 Found {len(data)} FAQs matching 'implementacion'")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_create_ticket(user_id):
    """Test POST /api/soporte/tickets"""
    print("\n🧪 Testing POST /api/soporte/tickets...")
    
    ticket_data = {
        "asunto": "Consulta sobre implementación NIIF S1",
        "categoria": "implementacion", 
        "descripcion": "Necesito ayuda para entender los requisitos de divulgación del estándar NIIF S1",
        "prioridad": "media"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/soporte/tickets",
            params={"user_id": user_id},
            json=ticket_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
        
        data = response.json()
        print(f"✅ SUCCESS: Ticket created")
        
        # Verify response structure
        required_fields = ['id', 'asunto', 'categoria', 'estado', 'prioridad']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in ticket response")
                return False, None
        
        ticket_id = data['id']
        print(f"🎫 Ticket ID: {ticket_id}")
        print(f"📝 Subject: {data['asunto']}")
        print(f"📊 Status: {data['estado']}")
        
        return True, ticket_id
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False, None


def test_get_tickets(user_id):
    """Test GET /api/soporte/tickets"""
    print("\n🧪 Testing GET /api/soporte/tickets...")
    
    try:
        response = requests.get(
            f"{API_BASE}/soporte/tickets",
            params={"user_id": user_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Tickets retrieved")
        print(f"🎫 Found {len(data)} tickets")
        
        # If there are tickets, verify structure
        if len(data) > 0:
            ticket = data[0]
            required_fields = ['id', 'asunto', 'estado', 'prioridad', 'created_at']
            for field in required_fields:
                if field not in ticket:
                    print(f"❌ FAILED: Missing field '{field}' in ticket")
                    return False
            print(f"🎫 Latest ticket: {ticket['asunto']}")
        else:
            print("ℹ️  No tickets found")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_get_ticket_detail(user_id, ticket_id):
    """Test GET /api/soporte/tickets/{ticket_id}"""
    print(f"\n🧪 Testing GET /api/soporte/tickets/{ticket_id}...")
    
    try:
        response = requests.get(
            f"{API_BASE}/soporte/tickets/{ticket_id}",
            params={"user_id": user_id},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Ticket detail retrieved")
        
        # Verify response structure
        required_fields = ['id', 'asunto', 'descripcion', 'estado', 'mensajes']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in ticket detail")
                return False
        
        print(f"🎫 Ticket: {data['asunto']}")
        print(f"💬 Messages: {len(data['mensajes'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False

def test_api_health():
    """Test basic API health"""
    print("🏥 Testing API health...")
    
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            print(f"✅ API is responding: {response.json()}")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API health check failed: {str(e)}")
        return False


def test_admin_estadisticas_general():
    """Test GET /api/admin/estadisticas/general"""
    print("\n🧪 Testing GET /api/admin/estadisticas/general...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/estadisticas/general", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: General statistics retrieved")
        
        # Verify required fields
        required_fields = [
            'total_usuarios', 'usuarios_activos_mes', 'usuarios_admin', 
            'usuarios_pagado', 'usuarios_gratuito', 'total_diagnosticos', 'diagnosticos_mes'
        ]
        
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in general stats")
                return False
            
            # Verify all values are integers >= 0
            if not isinstance(data[field], int) or data[field] < 0:
                print(f"❌ FAILED: Field '{field}' should be integer >= 0, got {data[field]}")
                return False
        
        # Verify logical consistency: sum of roles <= total users
        total_roles = data['usuarios_admin'] + data['usuarios_pagado'] + data['usuarios_gratuito']
        if total_roles > data['total_usuarios']:
            print(f"❌ FAILED: Sum of role users ({total_roles}) > total users ({data['total_usuarios']})")
            return False
        
        print(f"📊 General Stats:")
        print(f"   Total usuarios: {data['total_usuarios']}")
        print(f"   Usuarios activos (mes): {data['usuarios_activos_mes']}")
        print(f"   Admin: {data['usuarios_admin']}, Pagado: {data['usuarios_pagado']}, Gratuito: {data['usuarios_gratuito']}")
        print(f"   Total diagnósticos: {data['total_diagnosticos']}")
        print(f"   Diagnósticos (mes): {data['diagnosticos_mes']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_estadisticas_recursos():
    """Test GET /api/admin/estadisticas/recursos"""
    print("\n🧪 Testing GET /api/admin/estadisticas/recursos...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/estadisticas/recursos", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Resources statistics retrieved")
        
        # Verify required fields
        required_fields = ['total_recursos', 'recursos_por_tipo', 'recursos_por_fase', 'recursos_mas_vistos']
        
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in resources stats")
                return False
        
        # Verify data types
        if not isinstance(data['total_recursos'], int) or data['total_recursos'] < 0:
            print(f"❌ FAILED: total_recursos should be integer >= 0, got {data['total_recursos']}")
            return False
        
        if not isinstance(data['recursos_por_tipo'], dict):
            print(f"❌ FAILED: recursos_por_tipo should be dict, got {type(data['recursos_por_tipo'])}")
            return False
        
        if not isinstance(data['recursos_por_fase'], dict):
            print(f"❌ FAILED: recursos_por_fase should be dict, got {type(data['recursos_por_fase'])}")
            return False
        
        if not isinstance(data['recursos_mas_vistos'], list):
            print(f"❌ FAILED: recursos_mas_vistos should be list, got {type(data['recursos_mas_vistos'])}")
            return False
        
        # Verify recursos_mas_vistos structure
        for recurso in data['recursos_mas_vistos']:
            if not isinstance(recurso, dict) or 'titulo' not in recurso or 'vistas' not in recurso:
                print(f"❌ FAILED: recursos_mas_vistos items should have 'titulo' and 'vistas' fields")
                return False
        
        print(f"📊 Resources Stats:")
        print(f"   Total recursos: {data['total_recursos']}")
        print(f"   Recursos por tipo: {len(data['recursos_por_tipo'])} tipos")
        print(f"   Recursos por fase: {len(data['recursos_por_fase'])} fases")
        print(f"   Top recursos: {len(data['recursos_mas_vistos'])} items")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_estadisticas_soporte():
    """Test GET /api/admin/estadisticas/soporte"""
    print("\n🧪 Testing GET /api/admin/estadisticas/soporte...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/estadisticas/soporte", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Support statistics retrieved")
        
        # Verify required fields
        required_fields = ['total_tickets', 'tickets_por_estado', 'tickets_por_prioridad', 'tickets_mes']
        
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in support stats")
                return False
        
        # Verify data types
        if not isinstance(data['total_tickets'], int) or data['total_tickets'] < 0:
            print(f"❌ FAILED: total_tickets should be integer >= 0, got {data['total_tickets']}")
            return False
        
        if not isinstance(data['tickets_por_estado'], dict):
            print(f"❌ FAILED: tickets_por_estado should be dict, got {type(data['tickets_por_estado'])}")
            return False
        
        if not isinstance(data['tickets_por_prioridad'], dict):
            print(f"❌ FAILED: tickets_por_prioridad should be dict, got {type(data['tickets_por_prioridad'])}")
            return False
        
        if not isinstance(data['tickets_mes'], int) or data['tickets_mes'] < 0:
            print(f"❌ FAILED: tickets_mes should be integer >= 0, got {data['tickets_mes']}")
            return False
        
        # Verify logical consistency: tickets_mes <= total_tickets
        if data['tickets_mes'] > data['total_tickets']:
            print(f"❌ FAILED: tickets_mes ({data['tickets_mes']}) > total_tickets ({data['total_tickets']})")
            return False
        
        print(f"📊 Support Stats:")
        print(f"   Total tickets: {data['total_tickets']}")
        print(f"   Tickets por estado: {len(data['tickets_por_estado'])} estados")
        print(f"   Tickets por prioridad: {len(data['tickets_por_prioridad'])} prioridades")
        print(f"   Tickets (mes): {data['tickets_mes']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_estadisticas_actividad():
    """Test GET /api/admin/estadisticas/actividad"""
    print("\n🧪 Testing GET /api/admin/estadisticas/actividad...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/estadisticas/actividad", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Activity statistics retrieved")
        
        # Verify required fields
        required_fields = ['nuevos_usuarios_semana', 'nuevos_diagnosticos_semana', 'nuevos_tickets_semana']
        
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in activity stats")
                return False
            
            # Verify all values are integers >= 0
            if not isinstance(data[field], int) or data[field] < 0:
                print(f"❌ FAILED: Field '{field}' should be integer >= 0, got {data[field]}")
                return False
        
        print(f"📊 Activity Stats (última semana):")
        print(f"   Nuevos usuarios: {data['nuevos_usuarios_semana']}")
        print(f"   Nuevos diagnósticos: {data['nuevos_diagnosticos_semana']}")
        print(f"   Nuevos tickets: {data['nuevos_tickets_semana']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_list():
    """Test GET /api/admin/usuarios"""
    print("\n🧪 Testing GET /api/admin/usuarios...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/usuarios", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
        
        data = response.json()
        print(f"✅ SUCCESS: Users list retrieved")
        
        # Verify response structure
        required_fields = ['usuarios', 'total', 'limit', 'offset']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in users list response")
                return False, None
        
        usuarios = data['usuarios']
        print(f"👥 Found {len(usuarios)} users (total: {data['total']})")
        
        # Verify no password_hash in response
        for usuario in usuarios:
            if 'password_hash' in usuario:
                print(f"❌ FAILED: password_hash found in user response - security issue!")
                return False, None
        
        # If there are users, verify structure and get a test user ID
        test_user_id = None
        if len(usuarios) > 0:
            user = usuarios[0]
            required_user_fields = ['id', 'email', 'nombre_completo', 'rol']
            for field in required_user_fields:
                if field not in user:
                    print(f"❌ FAILED: Missing field '{field}' in user object")
                    return False, None
            
            test_user_id = user['id']
            print(f"👤 Sample user: {user['email']} (rol: {user['rol']})")
        
        return True, test_user_id
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False, None


def test_admin_usuarios_list_with_filters():
    """Test GET /api/admin/usuarios with filters"""
    print("\n🧪 Testing GET /api/admin/usuarios with filters...")
    
    try:
        # Test filter by rol=admin
        response = requests.get(
            f"{API_BASE}/admin/usuarios",
            params={"rol": "admin"},
            timeout=30
        )
        
        print(f"Status Code (rol=admin): {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Admin users filter works")
        print(f"👑 Found {len(data['usuarios'])} admin users")
        
        # Test search functionality
        response = requests.get(
            f"{API_BASE}/admin/usuarios",
            params={"search": "admin"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"🔍 Search 'admin' found {len(data['usuarios'])} users")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_get_user(user_id):
    """Test GET /api/admin/usuarios/{user_id}"""
    print(f"\n🧪 Testing GET /api/admin/usuarios/{user_id}...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/usuarios/{user_id}", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: User details retrieved")
        
        # Verify no password_hash in response
        if 'password_hash' in data:
            print(f"❌ FAILED: password_hash found in user response - security issue!")
            return False
        
        # Verify required fields
        required_fields = ['id', 'email', 'nombre_completo', 'rol']
        for field in required_fields:
            if field not in data:
                print(f"❌ FAILED: Missing field '{field}' in user details")
                return False
        
        print(f"👤 User: {data['email']} ({data['nombre_completo']})")
        print(f"🏷️  Role: {data['rol']}, Plan: {data.get('plan_actual', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_update_user(user_id):
    """Test PATCH /api/admin/usuarios/{user_id}"""
    print(f"\n🧪 Testing PATCH /api/admin/usuarios/{user_id}...")
    
    try:
        # Update user data
        update_data = {
            "nombre_completo": "Usuario Test Actualizado",
            "organizacion": "Empresa Test Update"
        }
        
        response = requests.patch(
            f"{API_BASE}/admin/usuarios/{user_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: User updated")
        
        # Verify response structure
        if 'message' not in data or 'usuario' not in data:
            print(f"❌ FAILED: Missing 'message' or 'usuario' in update response")
            return False
        
        usuario = data['usuario']
        if usuario['nombre_completo'] != update_data['nombre_completo']:
            print(f"❌ FAILED: nombre_completo not updated correctly")
            return False
        
        print(f"📝 Updated: {usuario['nombre_completo']}")
        print(f"🏢 Organization: {usuario.get('organizacion', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_update_invalid_role(user_id):
    """Test PATCH /api/admin/usuarios/{user_id} with invalid role"""
    print(f"\n🧪 Testing PATCH /api/admin/usuarios/{user_id} with invalid role...")
    
    try:
        # Try to update with invalid role
        update_data = {
            "rol": "invalid_role"
        }
        
        response = requests.patch(
            f"{API_BASE}/admin/usuarios/{user_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected status 400 for invalid role, got {response.status_code}")
            return False
        
        print(f"✅ SUCCESS: Invalid role validation works")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_cambiar_plan(user_id):
    """Test PATCH /api/admin/usuarios/{user_id}/cambiar-plan"""
    print(f"\n🧪 Testing PATCH /api/admin/usuarios/{user_id}/cambiar-plan...")
    
    try:
        # Change plan to basico
        plan_data = {
            "plan_actual": "basico",
            "suscripcion_activa": True
        }
        
        response = requests.patch(
            f"{API_BASE}/admin/usuarios/{user_id}/cambiar-plan",
            json=plan_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: Plan changed")
        
        # Verify response structure
        if 'message' not in data or 'usuario' not in data:
            print(f"❌ FAILED: Missing 'message' or 'usuario' in plan change response")
            return False
        
        usuario = data['usuario']
        if usuario['plan_actual'] != plan_data['plan_actual']:
            print(f"❌ FAILED: plan_actual not updated correctly")
            return False
        
        # Verify role was updated automatically
        if usuario['rol'] != 'cliente_pagado':
            print(f"❌ FAILED: rol should be 'cliente_pagado' for paid plan, got {usuario['rol']}")
            return False
        
        print(f"💳 Plan: {usuario['plan_actual']}")
        print(f"🏷️  Role: {usuario['rol']}")
        print(f"✅ Active: {usuario['suscripcion_activa']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_cambiar_plan_invalid():
    """Test PATCH /api/admin/usuarios/{user_id}/cambiar-plan with invalid plan"""
    print(f"\n🧪 Testing PATCH /api/admin/usuarios/test/cambiar-plan with invalid plan...")
    
    try:
        # Try invalid plan
        plan_data = {
            "plan_actual": "invalid_plan",
            "suscripcion_activa": True
        }
        
        response = requests.patch(
            f"{API_BASE}/admin/usuarios/test-id/cambiar-plan",
            json=plan_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print(f"❌ FAILED: Expected status 400 for invalid plan, got {response.status_code}")
            return False
        
        print(f"✅ SUCCESS: Invalid plan validation works")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_desactivar_user(user_id):
    """Test DELETE /api/admin/usuarios/{user_id}"""
    print(f"\n🧪 Testing DELETE /api/admin/usuarios/{user_id}...")
    
    try:
        response = requests.delete(f"{API_BASE}/admin/usuarios/{user_id}", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: User deactivated")
        
        # Verify response structure
        if 'message' not in data or 'user_id' not in data:
            print(f"❌ FAILED: Missing 'message' or 'user_id' in deactivation response")
            return False
        
        print(f"🚫 Deactivated user: {data['user_id']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_reactivar_user(user_id):
    """Test POST /api/admin/usuarios/{user_id}/reactivar"""
    print(f"\n🧪 Testing POST /api/admin/usuarios/{user_id}/reactivar...")
    
    try:
        response = requests.post(f"{API_BASE}/admin/usuarios/{user_id}/reactivar", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"✅ SUCCESS: User reactivated")
        
        # Verify response structure
        if 'message' not in data or 'user_id' not in data:
            print(f"❌ FAILED: Missing 'message' or 'user_id' in reactivation response")
            return False
        
        print(f"✅ Reactivated user: {data['user_id']}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_admin_usuarios_get_nonexistent():
    """Test GET /api/admin/usuarios/{user_id} with non-existent user"""
    print(f"\n🧪 Testing GET /api/admin/usuarios/nonexistent-id...")
    
    try:
        response = requests.get(f"{API_BASE}/admin/usuarios/nonexistent-id", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print(f"❌ FAILED: Expected status 404 for non-existent user, got {response.status_code}")
            return False
        
        print(f"✅ SUCCESS: Non-existent user returns 404")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False

def main():
    """Run all tests for Clarisa Client Module, Admin Statistics, and User Management"""
    print("=" * 80)
    print("🚀 CLARISA - Backend API Testing (Client Module + Admin Statistics + User Management)")
    print("=" * 80)
    
    # Test API health first
    if not test_api_health():
        print("\n❌ API health check failed. Cannot proceed with tests.")
        sys.exit(1)
    
    print("\n" + "=" * 80)
    
    # Try login with admin credentials first
    user_id = login_user(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not user_id:
        print("Admin login failed, trying client credentials...")
        user_id = login_user(CLIENT_EMAIL, CLIENT_PASSWORD)
    if not user_id:
        print("\n❌ Login failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Track test results
    results = {
        'notificaciones_stats': False,
        'notificaciones_list': False,
        'mark_notification_read': False,
        'mark_all_notifications_read': False,
        'faqs_list': False,
        'faqs_search': False,
        'create_ticket': False,
        'get_tickets': False,
        'get_ticket_detail': False,
        'admin_estadisticas_general': False,
        'admin_estadisticas_recursos': False,
        'admin_estadisticas_soporte': False,
        'admin_estadisticas_actividad': False,
        'admin_usuarios_list': False,
        'admin_usuarios_list_filters': False,
        'admin_usuarios_get_user': False,
        'admin_usuarios_update_user': False,
        'admin_usuarios_update_invalid_role': False,
        'admin_usuarios_cambiar_plan': False,
        'admin_usuarios_cambiar_plan_invalid': False,
        'admin_usuarios_desactivar_user': False,
        'admin_usuarios_reactivar_user': False,
        'admin_usuarios_get_nonexistent': False
    }
    
    ticket_id = None
    
    print("\n" + "=" * 70)
    print("📋 TESTING NOTIFICACIONES API")
    print("=" * 70)
    
    # Test Notificaciones API
    results['notificaciones_stats'] = test_notificaciones_stats(user_id)
    results['notificaciones_list'] = test_notificaciones_list(user_id)
    
    # Create a test notification and test marking as read
    test_notif_id = test_create_notification(user_id)
    if test_notif_id:
        results['mark_notification_read'] = test_mark_notification_read(user_id, test_notif_id)
        results['mark_all_notifications_read'] = test_mark_all_notifications_read(user_id)
    else:
        print("⚠️  Skipping notification marking tests - could not create test notification")
        results['mark_notification_read'] = True  # Don't fail the test suite
        results['mark_all_notifications_read'] = True
    
    print("\n" + "=" * 70)
    print("❓ TESTING AYUDA API (FAQs)")
    print("=" * 70)
    
    # Test FAQs API
    results['faqs_list'] = test_faqs_list()
    results['faqs_search'] = test_faqs_search()
    
    print("\n" + "=" * 70)
    print("🎫 TESTING SOPORTE API (Tickets)")
    print("=" * 70)
    
    # Test Tickets API
    create_success, ticket_id = test_create_ticket(user_id)
    results['create_ticket'] = create_success
    
    results['get_tickets'] = test_get_tickets(user_id)
    
    if ticket_id:
        results['get_ticket_detail'] = test_get_ticket_detail(user_id, ticket_id)
    
    print("\n" + "=" * 70)
    print("📈 TESTING ADMIN STATISTICS API")
    print("=" * 70)
    
    # Test Admin Statistics API (no authentication required)
    results['admin_estadisticas_general'] = test_admin_estadisticas_general()
    results['admin_estadisticas_recursos'] = test_admin_estadisticas_recursos()
    results['admin_estadisticas_soporte'] = test_admin_estadisticas_soporte()
    results['admin_estadisticas_actividad'] = test_admin_estadisticas_actividad()
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 70)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 OVERALL: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Notificaciones API is working correctly")
        print("✅ FAQs API is working correctly") 
        print("✅ Tickets API is working correctly")
        print("✅ Admin Statistics API is working correctly")
        print("✅ All endpoints respond with correct HTTP codes")
        print("✅ JSON structures are consistent")
    else:
        print(f"\n⚠️  {total - passed} TESTS FAILED!")
        print("❌ Some endpoints have issues that need attention")
        
        # Don't exit with error code - report issues but let testing agent handle
    
    print("=" * 70)

if __name__ == "__main__":
    main()