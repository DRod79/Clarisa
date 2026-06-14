"""
Auth fallback - Permite login cuando Supabase no está disponible
SOLO PARA DESARROLLO/EMERGENCIA
"""
import hashlib
from typing import Optional

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# Usuarios de respaldo cuando Supabase no está disponible
FALLBACK_USERS = {
    'admin@clarisa.com': {
        'id': 'admin-fallback-001',
        'email': 'admin@clarisa.com',
        'nombre_completo': 'Admin Clarisa',
        'organizacion': 'Clarisa',
        'rol': 'admin',
        'plan_actual': 'admin',
        'suscripcion_activa': True,
        'password_hash': hash_password('TodoEsProbar2026*'),
        'pais': 'Colombia',
        'puesto': 'Administrador'
    },
    'cliente@test.com': {
        'id': 'cliente-fallback-001',
        'email': 'cliente@test.com',
        'nombre_completo': 'Usuario Test',
        'organizacion': 'Empresa Test',
        'rol': 'cliente_gratuito',
        'plan_actual': 'gratuito',
        'suscripcion_activa': True,
        'password_hash': hash_password('TodoEsCuestion2026*'),
        'pais': 'Colombia',
        'puesto': 'Usuario'
    }
}

async def get_user_by_email_fallback(email: str) -> Optional[dict]:
    """Get user from fallback when Supabase is unavailable"""
    user = FALLBACK_USERS.get(email)
    if user:
        # Return a copy to avoid modifying the original
        return dict(user)
    return None

def verify_password_fallback(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed
