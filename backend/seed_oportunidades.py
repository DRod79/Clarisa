#!/usr/bin/env python3
"""
Script para crear oportunidades de prueba
"""
import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')  # Usar SERVICE_KEY para bypassear RLS

# Datos de prueba
CLIENTES_PRUEBA = [
    {
        'nombre_cliente': 'Carlos Rodríguez',
        'email_cliente': 'carlos.rodriguez@empresaabc.com',
        'organizacion': 'Empresa ABC S.A.',
        'arquetipo_niif': 'UH-MN-CB',
        'prioridad': 'A1',
        'scoring': {'urgencia': 85, 'madurez': 75, 'capacidad': 90},
        'etapa': 'contacto_inicial'
    },
    {
        'nombre_cliente': 'María González',
        'email_cliente': 'm.gonzalez@techcorp.com',
        'organizacion': 'TechCorp Ltda',
        'arquetipo_niif': 'UM-MN-CB',
        'prioridad': 'A2',
        'scoring': {'urgencia': 80, 'madurez': 60, 'capacidad': 85},
        'etapa': 'calificado'
    },
    {
        'nombre_cliente': 'Juan Pérez',
        'email_cliente': 'jperez@innova.co',
        'organizacion': 'Innova Solutions',
        'arquetipo_niif': 'UH-ML-CB',
        'prioridad': 'B1',
        'scoring': {'urgencia': 55, 'madurez': 50, 'capacidad': 60},
        'etapa': 'diagnostico_profundo'
    },
    {
        'nombre_cliente': 'Ana Martínez',
        'email_cliente': 'ana.m@startup.io',
        'organizacion': 'Startup Tech',
        'arquetipo_niif': 'UM-ML-CB',
        'prioridad': 'B2',
        'scoring': {'urgencia': 50, 'madurez': 45, 'capacidad': 55},
        'etapa': 'nuevo_lead'
    },
    {
        'nombre_cliente': 'Pedro Sánchez',
        'email_cliente': 'psanchez@comercial.com',
        'organizacion': 'Comercial del Sur',
        'arquetipo_niif': 'UB-ML-CB',
        'prioridad': 'C1',
        'scoring': {'urgencia': 30, 'madurez': 35, 'capacidad': 40},
        'etapa': 'en_nutricion'
    },
]

def crear_oportunidad(cliente_data):
    """Crea una oportunidad en Supabase"""
    try:
        # Calcular scoring total
        scoring_total = sum(cliente_data['scoring'].values()) // 3
        
        # Calcular valor estimado basado en prioridad
        valores = {
            'A1': random.randint(40000, 60000),
            'A2': random.randint(30000, 45000),
            'A3': random.randint(20000, 35000),
            'B1': random.randint(12000, 18000),
            'B2': random.randint(8000, 15000),
            'B3': random.randint(5000, 10000),
            'C1': random.randint(3000, 6000),
            'C2': random.randint(2000, 4000),
            'C3': random.randint(1000, 2500),
        }
        
        # Calcular probabilidad basada en etapa
        probabilidades = {
            'nuevo_lead': random.randint(10, 20),
            'calificado': random.randint(20, 30),
            'contacto_inicial': random.randint(30, 40),
            'diagnostico_profundo': random.randint(40, 55),
            'consultoria_activa': random.randint(55, 70),
            'preparando_solucion': random.randint(65, 80),
            'negociacion': random.randint(75, 90),
            'en_nutricion': random.randint(5, 15)
        }
        
        # Fecha de creación (entre 1 y 30 días atrás)
        dias_atras = random.randint(1, 30)
        fecha_creacion = (datetime.utcnow() - timedelta(days=dias_atras)).isoformat()
        
        # Fecha estimada de cierre (entre 15 y 90 días en el futuro)
        dias_futuro = random.randint(15, 90)
        fecha_cierre = (datetime.utcnow() + timedelta(days=dias_futuro)).date().isoformat()
        
        oportunidad = {
            'user_id': '9e8dc65f-d00e-40ea-b9de-8f2fa97e0a99',  # ID de ejemplo, ajustar si es necesario
            'diagnostico_id': None,  # Opcional
            'nombre_cliente': cliente_data['nombre_cliente'],
            'email_cliente': cliente_data['email_cliente'],
            'organizacion': cliente_data['organizacion'],
            'arquetipo_niif': cliente_data['arquetipo_niif'],
            'prioridad': cliente_data['prioridad'],
            'scoring_urgencia': cliente_data['scoring']['urgencia'],
            'scoring_madurez': cliente_data['scoring']['madurez'],
            'scoring_capacidad': cliente_data['scoring']['capacidad'],
            'scoring_total': scoring_total,
            'etapa_pipeline': cliente_data['etapa'],
            'valor_estimado_usd': valores.get(cliente_data['prioridad'], 5000),
            'probabilidad_cierre': probabilidades.get(cliente_data['etapa'], 20),
            'fecha_creacion': fecha_creacion,
            'fecha_estimada_cierre': fecha_cierre,
            'estado': 'activo',
            'notas': f"Oportunidad de prueba generada automáticamente. Arquetipo: {cliente_data['arquetipo_niif']}"
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/oportunidades",
            headers={
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Prefer': 'return=representation'
            },
            json=oportunidad,
            timeout=10
        )
        
        if response.status_code == 201:
            print(f"✅ Oportunidad creada: {cliente_data['nombre_cliente']} - {cliente_data['prioridad']}")
            return response.json()[0]
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creando oportunidad: {e}")
        return None

if __name__ == "__main__":
    print("="*60)
    print("CREANDO OPORTUNIDADES DE PRUEBA")
    print("="*60)
    
    for cliente in CLIENTES_PRUEBA:
        crear_oportunidad(cliente)
    
    print("="*60)
    print("PROCESO COMPLETADO")
    print("="*60)
