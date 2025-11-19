#!/usr/bin/env python3
"""
Script para verificar y reactivar el usuario cliente@test.com
"""
import requests
import os
import hashlib
from datetime import datetime

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verificar_usuario(email: str):
    """Verificar si el usuario existe"""
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
                print(f"✅ Usuario encontrado: {email}")
                print(f"   ID: {users[0].get('id')}")
                print(f"   Nombre: {users[0].get('nombre_completo')}")
                print(f"   Rol: {users[0].get('rol')}")
                print(f"   Activo: {users[0].get('activo')}")
                print(f"   Plan: {users[0].get('plan_actual')}")
                return users[0]
            else:
                print(f"❌ Usuario NO encontrado: {email}")
                return None
        else:
            print(f"❌ Error al buscar usuario: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def reactivar_usuario(user_id: str, email: str):
    """Reactivar usuario (actualizar activo=true)"""
    try:
        response = requests.patch(
            f"{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json={
                'activo': True,
                'updated_at': datetime.now().isoformat()
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Usuario reactivado exitosamente: {email}")
            return True
        else:
            print(f"❌ Error al reactivar: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def crear_usuario_cliente():
    """Crear usuario cliente@test.com si no existe"""
    email = "cliente@test.com"
    password = "password123"
    
    user_data = {
        'email': email,
        'password_hash': hash_password(password),
        'nombre_completo': 'Cliente Test',
        'organizacion': 'Empresa Test',
        'rol': 'cliente_gratuito',
        'activo': True,
        'plan_actual': 'gratuito',
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
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
            print(f"✅ Usuario creado exitosamente: {email}")
            print(f"   Password: {password}")
            print(f"   Rol: cliente_gratuito")
            return True
        else:
            print(f"❌ Error al crear usuario: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("VERIFICANDO Y REACTIVANDO USUARIO cliente@test.com")
    print("=" * 60)
    print()
    
    # Verificar si existe
    user = verificar_usuario("cliente@test.com")
    
    if user:
        # Si existe, verificar si está activo
        if not user.get('activo'):
            print("\n⚠️  Usuario existe pero está inactivo. Reactivando...")
            reactivar_usuario(user['id'], "cliente@test.com")
        else:
            print("\n✅ Usuario ya está activo y listo para usar")
        
        print("\n" + "=" * 60)
        print("CREDENCIALES DEL USUARIO:")
        print("=" * 60)
        print(f"Email: cliente@test.com")
        print(f"Password: password123")
        print(f"Rol: {user.get('rol')}")
        print(f"Plan: {user.get('plan_actual')}")
        
    else:
        # Si no existe, crearlo
        print("\n⚠️  Usuario no existe. Creando nuevo usuario...")
        crear_usuario_cliente()
    
    print("\n" + "=" * 60)
    print("VERIFICACIÓN FINAL:")
    print("=" * 60)
    verificar_usuario("cliente@test.com")
    
    print("\n✅ Proceso completado!")

if __name__ == "__main__":
    main()
