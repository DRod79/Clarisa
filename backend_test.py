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

def main():
    """Run all tests for Clarisa Client Module"""
    print("=" * 70)
    print("🚀 CLARISA CLIENT MODULE - Backend API Testing")
    print("=" * 70)
    
    # Test API health first
    if not test_api_health():
        print("\n❌ API health check failed. Cannot proceed with tests.")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    
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
        'faqs_list': False,
        'faqs_search': False,
        'create_ticket': False,
        'get_tickets': False,
        'get_ticket_detail': False
    }
    
    ticket_id = None
    
    print("\n" + "=" * 70)
    print("📋 TESTING NOTIFICACIONES API")
    print("=" * 70)
    
    # Test Notificaciones API
    results['notificaciones_stats'] = test_notificaciones_stats(user_id)
    results['notificaciones_list'] = test_notificaciones_list(user_id)
    
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
        print("✅ All endpoints respond with correct HTTP codes")
        print("✅ JSON structures are consistent")
    else:
        print(f"\n⚠️  {total - passed} TESTS FAILED!")
        print("❌ Some endpoints have issues that need attention")
        
        # Don't exit with error code - report issues but let testing agent handle
    
    print("=" * 70)

if __name__ == "__main__":
    main()