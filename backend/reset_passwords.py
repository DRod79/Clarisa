import requests
import hashlib
import os
import sys
sys.path.insert(0, '/app/backend')
from pathlib import Path
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Actualizar contraseñas
usuarios = [
    {'email': 'admin@clarisa.com', 'password': 'Test123*'},
    {'email': 'prueba@test.com', 'password': 'Test123*'},
]

for user_data in usuarios:
    # Obtener user_id
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?email=eq.{user_data['email']}",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        },
        timeout=10
    )
    
    if response.status_code == 200:
        users = response.json()
        if users:
            user_id = users[0]['id']
            
            # Actualizar contraseña
            hashed = hash_password(user_data['password'])
            update_response = requests.patch(
                f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
                headers={
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}'
                },
                json={'password_hash': hashed},
                timeout=10
            )
            
            if update_response.status_code == 204:
                print(f"✅ Contraseña actualizada: {user_data['email']} → {user_data['password']}")
            else:
                print(f"❌ Error actualizando {user_data['email']}: {update_response.text}")

print("\n" + "="*60)
print("CREDENCIALES ACTUALIZADAS:")
print("="*60)
print("ADMIN:")
print("  Email: admin@clarisa.com")
print("  Password: Test123*")
print("")
print("USUARIO TEST:")
print("  Email: prueba@test.com")
print("  Password: Test123*")
print("="*60)
