#!/usr/bin/env python3
"""
Script para resetear credenciales a valores conocidos
Ejecutar cuando el DNS esté funcionando
"""
import requests
import hashlib
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def test_connection():
    """Test if we can connect to Supabase"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/",
            headers={'apikey': SUPABASE_KEY},
            timeout=5
        )
        return True
    except Exception as e:
        print(f"❌ No se puede conectar a Supabase: {e}")
        return False

def update_password(email: str, new_password: str):
    """Update user password"""
    try:
        # Get user
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/users?email=eq.{email}",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Error al buscar usuario {email}: {response.status_code}")
            return False
        
        users = response.json()
        if not users:
            print(f"⚠️  Usuario {email} no existe")
            return False
        
        user_id = users[0]['id']
        hashed = hash_password(new_password)
        
        # Update password
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
            print(f"✅ Contraseña actualizada: {email}")
            return True
        else:
            print(f"❌ Error actualizando {email}: {update_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("🔐 SCRIPT DE RESETEO DE CREDENCIALES CLARISA")
    print("="*70 + "\n")
    
    # Test connection
    print("🔍 Probando conexión a Supabase...")
    if not test_connection():
        print("\n❌ ERROR DE CONEXIÓN")
        print("No se puede conectar a Supabase debido a problemas de DNS.")
        print("Por favor, contacta al soporte de Emergent para resolver el problema de DNS.")
        print("\nError específico: No se puede resolver 'sgmguxorpixygluwzjug.supabase.co'")
        sys.exit(1)
    
    print("✅ Conexión exitosa\n")
    
    # Credentials to set
    credentials = [
        {
            'email': 'admin@clarisa.com',
            'password': 'admin123',
            'role': 'admin'
        },
        {
            'email': 'cliente@test.com',
            'password': 'pass123',
            'role': 'cliente_gratuito'
        }
    ]
    
    print("📝 Actualizando credenciales...\n")
    
    success_count = 0
    for cred in credentials:
        if update_password(cred['email'], cred['password']):
            success_count += 1
    
    print("\n" + "="*70)
    print("✅ CREDENCIALES ACTUALIZADAS CORRECTAMENTE")
    print("="*70)
    print(f"\n{success_count}/{len(credentials)} usuarios actualizados\n")
    
    print("📋 CREDENCIALES FINALES:")
    print("-" * 70)
    for cred in credentials:
        print(f"\n{cred['role'].upper()}:")
        print(f"  Email:    {cred['email']}")
        print(f"  Password: {cred['password']}")
    
    print("\n" + "="*70)
    print("\n💡 Ahora puedes iniciar sesión con estas credenciales.\n")

if __name__ == "__main__":
    main()
