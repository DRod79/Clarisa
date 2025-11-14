#!/usr/bin/env python3
import requests
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/users?email=eq.admin@clarisa.com",
    headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}'
    },
    timeout=10
)

if response.status_code == 200:
    users = response.json()
    if users:
        print(f"Admin ID: {users[0]['id']}")
        print(f"Admin Email: {users[0]['email']}")
        print(f"Admin Rol: {users[0]['rol']}")
    else:
        print("No se encontró el usuario admin")
else:
    print(f"Error: {response.status_code}")
