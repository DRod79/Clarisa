"""
Script para limpiar e insertar todos los recursos
"""
import os
import requests
from dotenv import load_dotenv
from pathlib import Path
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

def limpiar_recursos():
    """Eliminar todos los recursos existentes"""
    print("🗑️  Eliminando recursos existentes...")
    try:
        # Primero eliminar interacciones
        response = requests.delete(
            f"{SUPABASE_URL}/rest/v1/recursos_usuario?user_id=neq.00000000-0000-0000-0000-000000000000",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        print(f"   Interacciones eliminadas: {response.status_code}")
        
        # Luego eliminar recursos
        response = requests.delete(
            f"{SUPABASE_URL}/rest/v1/recursos?id=neq.00000000-0000-0000-0000-000000000000",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}'
            },
            timeout=10
        )
        print(f"   Recursos eliminados: {response.status_code}")
        time.sleep(1)
        return True
    except Exception as e:
        print(f"❌ Error limpiando: {e}")
        return False

# Recursos por fase
recursos_por_fase = {
    1: [
        {
            'titulo': 'Guía de Diagnóstico NIIF S1/S2',
            'descripcion': 'Guía completa para realizar tu diagnóstico inicial de preparación para NIIF S1 y S2',
            'tipo': 'guia',
            'categoria': 'diagnostico',
            'contenido': 'Esta guía te ayudará a evaluar el estado actual de tu organización.',
            'acceso_requerido': 'gratuito',
            'fase_relacionada': 1,
            'nivel_dificultad': 'basico',
            'tags': ['diagnostico', 'niif', 's1', 's2'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Template de Autoevaluación',
            'descripcion': 'Plantilla Excel para evaluar el nivel de preparación de tu organización',
            'tipo': 'template',
            'categoria': 'diagnostico',
            'acceso_requerido': 'gratuito',
            'fase_relacionada': 1,
            'nivel_dificultad': 'basico',
            'tags': ['template', 'excel', 'autoevaluacion'],
            'publicado': True,
            'destacado': False
        },
        {
            'titulo': 'Video: Introducción a NIIF S1/S2',
            'descripcion': 'Video explicativo sobre los estándares NIIF S1 y S2',
            'tipo': 'video',
            'categoria': 'diagnostico',
            'url_externo': 'https://www.youtube.com/watch?v=ejemplo',
            'duracion_minutos': 15,
            'acceso_requerido': 'gratuito',
            'fase_relacionada': 1,
            'nivel_dificultad': 'basico',
            'tags': ['video', 'introduccion', 'niif'],
            'publicado': True,
            'destacado': True
        }
    ],
    2: [
        {
            'titulo': 'Guía de Análisis de Materialidad',
            'descripcion': 'Metodología para identificar temas ESG materiales',
            'tipo': 'guia',
            'categoria': 'materialidad',
            'contenido': 'El análisis de materialidad es fundamental para identificar los temas de sostenibilidad más relevantes.',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 2,
            'nivel_dificultad': 'intermedio',
            'tags': ['materialidad', 'esg', 'stakeholders'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Matriz de Materialidad - Template',
            'descripcion': 'Plantilla para crear tu matriz de materialidad',
            'tipo': 'template',
            'categoria': 'materialidad',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 2,
            'nivel_dificultad': 'intermedio',
            'tags': ['matriz', 'template', 'materialidad'],
            'publicado': True,
            'destacado': False
        },
        {
            'titulo': 'Caso de Estudio: Análisis de Materialidad en Retail',
            'descripcion': 'Ejemplo real de cómo una empresa retail realizó su análisis',
            'tipo': 'caso_estudio',
            'categoria': 'materialidad',
            'contenido': 'Caso: Retailer Latinoamericano con 150 tiendas.',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 2,
            'nivel_dificultad': 'intermedio',
            'tags': ['caso', 'retail', 'ejemplo'],
            'publicado': True,
            'destacado': False
        }
    ],
    3: [
        {
            'titulo': 'Guía de Identificación de Riesgos Climáticos',
            'descripcion': 'Cómo identificar riesgos físicos y de transición',
            'tipo': 'guia',
            'categoria': 'riesgos',
            'contenido': 'Identificación de Riesgos Climáticos según TCFD.',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 3,
            'nivel_dificultad': 'avanzado',
            'tags': ['riesgos', 'climaticos', 'tcfd'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Template de Matriz de Riesgos',
            'descripcion': 'Plantilla para evaluar y priorizar riesgos climáticos',
            'tipo': 'template',
            'categoria': 'riesgos',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 3,
            'nivel_dificultad': 'avanzado',
            'tags': ['riesgos', 'matriz', 'template'],
            'publicado': True,
            'destacado': False
        }
    ],
    4: [
        {
            'titulo': 'Guía de Cálculo de Huella de Carbono',
            'descripcion': 'Metodología completa para calcular emisiones Scope 1, 2 y 3',
            'tipo': 'guia',
            'categoria': 'medicion',
            'contenido': 'Cálculo de Huella de Carbono - Guía Completa.',
            'autor': 'Equipo Clarisa',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 4,
            'nivel_dificultad': 'avanzado',
            'tags': ['huella', 'carbono', 'ghg', 'scope'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Calculadora de Emisiones GEI',
            'descripcion': 'Herramienta interactiva para calcular tu huella',
            'tipo': 'herramienta',
            'categoria': 'medicion',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 4,
            'nivel_dificultad': 'intermedio',
            'tags': ['calculadora', 'emisiones', 'tool'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Factores de Emisión 2024',
            'descripcion': 'Base de datos actualizada de factores de emisión',
            'tipo': 'articulo',
            'categoria': 'medicion',
            'contenido': 'Factores de Emisión Actualizados 2024.',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 4,
            'nivel_dificultad': 'avanzado',
            'tags': ['factores', 'emisiones', 'datos'],
            'publicado': True,
            'destacado': False
        }
    ],
    5: [
        {
            'titulo': 'Template de Reporte NIIF S1',
            'descripcion': 'Plantilla completa para tu reporte de sostenibilidad S1',
            'tipo': 'template',
            'categoria': 'reporte',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 5,
            'nivel_dificultad': 'avanzado',
            'tags': ['reporte', 's1', 'template'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Template de Reporte NIIF S2',
            'descripcion': 'Plantilla completa para tu reporte climático S2',
            'tipo': 'template',
            'categoria': 'reporte',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 5,
            'nivel_dificultad': 'avanzado',
            'tags': ['reporte', 's2', 'template'],
            'publicado': True,
            'destacado': True
        },
        {
            'titulo': 'Guía de Divulgación y Comunicación',
            'descripcion': 'Mejores prácticas para comunicar tu desempeño ESG',
            'tipo': 'guia',
            'categoria': 'reporte',
            'contenido': 'Guía de Divulgación y Comunicación ESG.',
            'acceso_requerido': 'pagado',
            'fase_relacionada': 5,
            'nivel_dificultad': 'intermedio',
            'tags': ['divulgacion', 'comunicacion', 'esg'],
            'publicado': True,
            'destacado': False
        }
    ],
    0: [  # Recursos generales
        {
            'titulo': 'Glosario de Términos ESG',
            'descripcion': 'Diccionario completo de términos de sostenibilidad',
            'tipo': 'articulo',
            'categoria': 'general',
            'contenido': 'Glosario de Términos ESG y Sostenibilidad.',
            'acceso_requerido': 'gratuito',
            'fase_relacionada': None,
            'nivel_dificultad': 'basico',
            'tags': ['glosario', 'terminos', 'esg'],
            'publicado': True,
            'destacado': False
        },
        {
            'titulo': 'FAQ - Preguntas Frecuentes NIIF S1/S2',
            'descripcion': 'Respuestas a las preguntas más comunes',
            'tipo': 'articulo',
            'categoria': 'general',
            'contenido': 'Preguntas Frecuentes sobre NIIF S1/S2.',
            'acceso_requerido': 'gratuito',
            'fase_relacionada': None,
            'nivel_dificultad': 'basico',
            'tags': ['faq', 'preguntas', 'niif'],
            'publicado': True,
            'destacado': True
        }
    ]
}

def insertar_recursos():
    """Insertar recursos por fase"""
    print("\n📝 Insertando recursos...")
    total = 0
    exitosos = 0
    errores = 0
    
    for fase, recursos in sorted(recursos_por_fase.items()):
        fase_label = f"Fase {fase}" if fase > 0 else "Generales"
        print(f"\n{fase_label}:")
        
        for recurso in recursos:
            total += 1
            try:
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/recursos",
                    headers={
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': f'Bearer {SUPABASE_KEY}',
                        'Prefer': 'return=representation'
                    },
                    json=recurso,
                    timeout=10
                )
                
                if response.status_code == 201:
                    print(f"  ✅ {recurso['titulo']}")
                    exitosos += 1
                else:
                    print(f"  ❌ {recurso['titulo']}: {response.status_code} - {response.text[:100]}")
                    errores += 1
                    
                time.sleep(0.2)  # Pequeña pausa entre inserciones
                    
            except Exception as e:
                print(f"  ❌ {recurso['titulo']}: {str(e)}")
                errores += 1
    
    return total, exitosos, errores

def main():
    print("=" * 80)
    print("LIMPIAR E INSERTAR RECURSOS")
    print("=" * 80)
    
    # Limpiar
    if not limpiar_recursos():
        print("❌ Error al limpiar, abortando...")
        return
    
    # Insertar
    total, exitosos, errores = insertar_recursos()
    
    # Resumen
    print("\n" + "=" * 80)
    print(f"📊 RESUMEN:")
    print(f"   Total intentados: {total}")
    print(f"   ✅ Exitosos: {exitosos}")
    if errores > 0:
        print(f"   ❌ Errores: {errores}")
    print("=" * 80)

if __name__ == "__main__":
    main()
