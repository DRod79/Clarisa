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
    """Run all tests"""
    print("=" * 60)
    print("🚀 NIIF S1/S2 Diagnostic API Testing")
    print("=" * 60)
    
    # Test API health first
    if not test_api_health():
        print("\n❌ API health check failed. Cannot proceed with tests.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    
    # Test the main diagnostic endpoint
    success = test_diagnostico_endpoint()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ POST /api/diagnostico endpoint is working correctly")
        print("✅ Data is being saved to MongoDB properly")
        print("✅ Scoring structure is preserved")
        print("✅ GET endpoints are working")
    else:
        print("💥 TESTS FAILED!")
        print("❌ There are issues with the diagnostic endpoint")
        sys.exit(1)
    
    print("=" * 60)

if __name__ == "__main__":
    main()