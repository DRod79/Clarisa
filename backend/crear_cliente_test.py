"""
Script para crear usuario cliente de prueba
"""
import os
import requests
import hashlib
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_client_user(email: str, password: str):
    """Crear usuario cliente"""
    try:
        user_data = {
            'email': email,
            'password_hash': hash_password(password),
            'nombre_completo': 'Cliente Test',
            'nombre_empresa': 'Empresa Test',
            'rol': 'cliente_gratuito',
            'created_at': 'now()',
            'last_access': 'now()'
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/users",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=user_data,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Usuario cliente creado exitosamente")
            return response.json()[0]
        else:
            print(f"❌ Error al crear usuario: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("=" * 60)
    print("CREAR USUARIO CLIENTE DE PRUEBA")
    print("=" * 60)
    
    email = "cliente@test.com"
    password = "test123"
    
    print(f"\nCreando usuario: {email}")
    print(f"Contraseña: {password}")
    print()
    
    user = create_client_user(email, password)
    
    if user:
        print("\n" + "=" * 60)
        print("✅ USUARIO CLIENTE CREADO")
        print("=" * 60)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Rol: cliente_gratuito")
        print("=" * 60)

if __name__ == "__main__":
    main()
