"""
Script para resetear la contraseña del admin
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

def update_admin_password(email: str, new_password: str):
    """Actualizar contraseña del admin"""
    try:
        new_hash = hash_password(new_password)
        
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json={
                'password_hash': new_hash
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Contraseña actualizada exitosamente")
            return True
        else:
            print(f"❌ Error al actualizar contraseña: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("RESETEAR CONTRASEÑA DE ADMIN")
    print("=" * 60)
    
    email = "admin@clarisa.com"
    new_password = "admin123"
    
    print(f"\nActualizando contraseña para: {email}")
    print(f"Nueva contraseña: {new_password}")
    print(f"Hash: {hash_password(new_password)}")
    print()
    
    if update_admin_password(email, new_password):
        print("\n" + "=" * 60)
        print("✅ CONTRASEÑA RESETEADA EXITOSAMENTE")
        print("=" * 60)
        print(f"Email: {email}")
        print(f"Password: {new_password}")
        print("=" * 60)
    else:
        print("\n❌ No se pudo resetear la contraseña")

if __name__ == "__main__":
    main()
