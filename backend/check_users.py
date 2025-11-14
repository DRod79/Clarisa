import requests
import os
import sys
sys.path.insert(0, '/app/backend')
from pathlib import Path
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Obtener usuarios
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/users?select=id,email,rol",
    headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    },
    timeout=10
)

if response.status_code == 200:
    users = response.json()
    print("USUARIOS DISPONIBLES EN LA BASE DE DATOS:")
    print("="*60)
    for user in users:
        print(f"Email: {user['email']}")
        print(f"Rol: {user['rol']}")
        print(f"ID: {user['id']}")
        print("-"*60)
    print(f"\nTotal usuarios: {len(users)}")
else:
    print(f"Error: {response.status_code}")
