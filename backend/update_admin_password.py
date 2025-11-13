#!/usr/bin/env python3
"""
Script to update admin password in Supabase
"""
import requests
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def update_admin_password(email: str, new_password: str):
    """Update admin password"""
    try:
        # First, get the user
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
                print(f"Found user: {user['email']}, rol: {user.get('rol', 'N/A')}")
                
                # Update password
                hashed_password = hash_password(new_password)
                update_response = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/users?id=eq.{user['id']}",
                    headers={
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': f'Bearer {SUPABASE_KEY}'
                    },
                    json={'password_hash': hashed_password},
                    timeout=10
                )
                
                if update_response.status_code == 204:
                    print(f"✅ Password updated successfully for {email}")
                    print(f"New password: {new_password}")
                    return True
                else:
                    print(f"❌ Error updating password: {update_response.text}")
                    return False
            else:
                print(f"❌ User not found: {email}")
                return False
        else:
            print(f"❌ Error getting user: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Update admin password
    email = "admin@clarisa.com"
    new_password = "Test123*"
    
    print(f"Updating password for {email}...")
    update_admin_password(email, new_password)
