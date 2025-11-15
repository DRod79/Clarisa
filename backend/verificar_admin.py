"""
Script para verificar y crear usuario admin si no existe
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

def get_user_by_email(email: str):
    """Buscar usuario por email"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            users = response.json()
            return users[0] if users else None
        else:
            return None
    except Exception as e:
        print(f"Error buscando usuario: {e}")
        return None

def create_admin_user(email: str, password: str):
    """Crear usuario admin"""
    try:
        user_data = {
            'email': email,
            'password_hash': hash_password(password),
            'nombre_completo': 'Administrador',
            'nombre_empresa': 'Clarisa Admin',
            'rol': 'admin',
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
            print("✅ Usuario admin creado exitosamente")
            return response.json()[0]
        else:
            print(f"❌ Error al crear usuario: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("=" * 50)
    print("VERIFICACIÓN DE USUARIO ADMIN")
    print("=" * 50)
    
    # Buscar usuario admin
    email = "admin@clarisa.com"
    print(f"\n1. Buscando usuario: {email}")
    
    user = get_user_by_email(email)
    
    if user:
        print(f"✅ Usuario admin encontrado:")
        print(f"   - ID: {user.get('id')}")
        print(f"   - Email: {user.get('email')}")
        print(f"   - Rol: {user.get('rol')}")
        print(f"   - Nombre: {user.get('nombre_completo')}")
    else:
        print("❌ Usuario admin NO encontrado")
        print("\n2. Creando usuario admin...")
        
        # Crear usuario admin con contraseña: admin123
        user = create_admin_user(email, "admin123")
        
        if user:
            print("\n✅ USUARIO ADMIN CREADO")
            print(f"   Email: {email}")
            print(f"   Password: admin123")
            print(f"   Rol: admin")

if __name__ == "__main__":
    main()
