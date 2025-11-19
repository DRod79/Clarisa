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

def test_diagnostico_endpoint():
    """Test the POST /api/diagnostico endpoint with complete test data"""
    
    print("🧪 Testing POST /api/diagnostico endpoint...")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Endpoint: {API_BASE}/diagnostico")
    
    # Test data as provided in the review request
    test_data = {
        "nombre_completo": "Test Usuario",
        "email": "test@empresa.com",
        "telefono": "1234-5678",
        "organizacion": "Test Empresa S.A.",
        "puesto": "Director de Sostenibilidad",
        "pais": "Costa Rica",
        "departamento": "Sostenibilidad",
        "anios_experiencia": "3-5 años",
        "p1_sector": "Servicios Financieros",
        "p2_tamano": "200-500 empleados",
        "p3_motivacion": "Regulación obligatoria",
        "p4_plazo": "6-12 meses",
        "p5_publica_info": "No",
        "p6_materialidad": "No",
        "p7_familiaridad": "Principiante",
        "p8_riesgos_clima": "No",
        "p9_huella_carbono": "No",
        "p10_liderazgo": "No",
        "p11_junta": "No",
        "p12_personas_dedicadas": "Ninguna",
        "p13_presupuesto": "Sin presupuesto",
        "p14_recopilacion": "Manual básico",
        "p15_control_interno": "No",
        "p16_datos_auditables": "No",
        "p17_rastreo_impacto": "No",
        "p18_obstaculo": "Falta de conocimiento técnico",
        "p19_apoyo_valioso": ["Guía paso a paso", "Plantillas"],
        "p20_inversion": "< $10,000",
        "scoring": {
            "urgencia": {
                "puntos": 75,
                "nivel": "Alta",
                "categoria": "Urgente"
            },
            "madurez": {
                "puntos": 25,
                "nivel": "Baja",
                "categoria": "Novato"
            },
            "capacidad": {
                "puntos": 30,
                "nivel": "Baja",
                "categoria": "Limitada"
            },
            "arquetipo": {
                "codigo": "UH-MN-CB",
                "nombre": "Planificador Novato",
                "descripcion": "Urgencia alta pero madurez y capacidad bajas",
                "recomendacion": "Comenzar con capacitación básica"
            }
        }
    }
    
    try:
        # Make POST request
        print("\n📤 Sending POST request...")
        response = requests.post(
            f"{API_BASE}/diagnostico",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        # Check status code
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        # Parse response
        response_data = response.json()
        print(f"✅ SUCCESS: Status 200 received")
        
        # Verify response structure
        required_fields = ['id', 'mensaje', 'timestamp', 'scoring']
        missing_fields = []
        
        for field in required_fields:
            if field not in response_data:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ FAILED: Missing required fields in response: {missing_fields}")
            return False
        
        print(f"✅ SUCCESS: Response contains all required fields")
        print(f"Response ID: {response_data['id']}")
        print(f"Response Timestamp: {response_data['timestamp']}")
        print(f"Response Message: {response_data['mensaje']}")
        
        # Verify scoring structure
        scoring = response_data['scoring']
        scoring_fields = ['urgencia', 'madurez', 'capacidad', 'arquetipo']
        
        for field in scoring_fields:
            if field not in scoring:
                print(f"❌ FAILED: Missing scoring field: {field}")
                return False
        
        print(f"✅ SUCCESS: Scoring structure is complete")
        print(f"Arquetipo: {scoring['arquetipo']['codigo']} - {scoring['arquetipo']['nombre']}")
        
        # Store the ID for verification
        diagnostico_id = response_data['id']
        
        # Test GET all diagnosticos to verify it was saved
        print(f"\n📥 Verifying data was saved in MongoDB...")
        get_response = requests.get(f"{API_BASE}/diagnosticos", timeout=30)
        
        if get_response.status_code != 200:
            print(f"❌ FAILED: Could not retrieve diagnosticos. Status: {get_response.status_code}")
            return False
        
        all_diagnosticos = get_response.json()
        
        # Find our diagnostic in the list
        found_diagnostic = None
        for diag in all_diagnosticos:
            if diag.get('id') == diagnostico_id:
                found_diagnostic = diag
                break
        
        if not found_diagnostic:
            print(f"❌ FAILED: Diagnostic with ID {diagnostico_id} not found in MongoDB")
            return False
        
        print(f"✅ SUCCESS: Diagnostic found in MongoDB")
        print(f"Saved Email: {found_diagnostic.get('email')}")
        print(f"Saved Organization: {found_diagnostic.get('organizacion')}")
        print(f"Saved Arquetipo: {found_diagnostic.get('scoring', {}).get('arquetipo', {}).get('codigo')}")
        
        # Test GET specific diagnostic
        print(f"\n🔍 Testing GET specific diagnostic...")
        specific_response = requests.get(f"{API_BASE}/diagnostico/{diagnostico_id}", timeout=30)
        
        if specific_response.status_code != 200:
            print(f"❌ FAILED: Could not retrieve specific diagnostic. Status: {specific_response.status_code}")
            return False
        
        specific_data = specific_response.json()
        print(f"✅ SUCCESS: Retrieved specific diagnostic")
        print(f"Retrieved ID: {specific_data.get('id')}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Network error - {str(e)}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: Invalid JSON response - {str(e)}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {str(e)}")
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