import hashlib
import secrets
import requests
import os
from datetime import datetime
from typing import Optional

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def generate_session_token() -> str:
    """Generate a random session token"""
    return secrets.token_urlsafe(32)

async def create_user_in_supabase(user_data: dict) -> tuple:
    """Create user in Supabase using REST API"""
    try:
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
        
        if response.status_code == 201:
            return response.json()[0], None
        else:
            return None, response.text
    except Exception as e:
        return None, str(e)

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user from Supabase by email"""
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
            return users[0] if users else None
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user from Supabase by ID"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            users = response.json()
            return users[0] if users else None
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

async def update_user_last_access(user_id: str):
    """Update user's last access time"""
    try:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            json={'ultimo_acceso': datetime.utcnow().isoformat()},
            timeout=10
        )
        return response.status_code == 204
    except Exception as e:
        print(f"Error updating last access: {e}")
        return False
