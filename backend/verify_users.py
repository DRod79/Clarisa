import requests
import os
import hashlib
import sys

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_all_users():
    """Get all users from Supabase"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: Status {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting users: {e}")
        return None

def verify_credentials(email: str, password: str):
    """Verify if credentials match"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                password_hash = hash_password(password)
                stored_hash = user.get('password_hash', '')
                match = password_hash == stored_hash
                
                print(f"\n{'='*60}")
                print(f"Email: {email}")
                print(f"Usuario encontrado: Sí")
                print(f"Rol: {user.get('rol', 'N/A')}")
                print(f"Password ingresado: {password}")
                print(f"Hash generado: {password_hash[:20]}...")
                print(f"Hash almacenado: {stored_hash[:20]}...")
                print(f"¿Coincide?: {'✅ SÍ' if match else '❌ NO'}")
                print(f"{'='*60}\n")
                
                return match
            else:
                print(f"\n❌ No se encontró usuario con email: {email}\n")
                return False
        else:
            print(f"Error consultando usuario: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🔍 VERIFICACIÓN DE USUARIOS EN SUPABASE\n")
    
    # Listar todos los usuarios
    print("📋 Listando todos los usuarios...\n")
    users = get_all_users()
    
    if users:
        print(f"Total de usuarios encontrados: {len(users)}\n")
        for user in users:
            print(f"- Email: {user.get('email')}")
            print(f"  Rol: {user.get('rol')}")
            print(f"  ID: {user.get('id')}")
            print(f"  Password Hash: {user.get('password_hash', '')[:30]}...")
            print()
    else:
        print("❌ No se pudieron obtener usuarios o hay un problema de conexión\n")
        sys.exit(1)
    
    # Verificar credenciales específicas
    print("\n🔐 VERIFICANDO CREDENCIALES...\n")
    
    # Test 1: Admin
    print("Test 1: Usuario Admin")
    verify_credentials("admin@clarisa.com", "admin123")
    
    # Test 2: Cliente
    print("Test 2: Usuario Cliente")
    verify_credentials("cliente@test.com", "pass123")
    
    # Probar otros passwords comunes
    print("Test 3: Cliente con password123")
    verify_credentials("cliente@test.com", "password123")
    
    print("Test 4: Cliente con Pass123")
    verify_credentials("cliente@test.com", "Pass123")
