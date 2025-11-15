"""
Script para insertar todos los recursos de ejemplo en Supabase
"""
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

recursos_data = [
    # Fase 1: Diagnóstico
    {
        'titulo': 'Guía de Diagnóstico NIIF S1/S2',
        'descripcion': 'Guía completa para realizar tu diagnóstico inicial de preparación para NIIF S1 y S2',
        'tipo': 'guia',
        'categoria': 'diagnostico',
        'contenido': 'Esta guía te ayudará a evaluar el estado actual de tu organización frente a los requisitos de los estándares NIIF S1 (Requisitos Generales) y S2 (Divulgaciones relacionadas con el clima).\n\n**Paso 1: Evaluación inicial**\n- Revisar estructura organizacional\n- Identificar stakeholders clave\n- Evaluar madurez actual en sostenibilidad\n\n**Paso 2: Gap Analysis**\n- Comparar estado actual vs requisitos NIIF\n- Identificar brechas críticas\n- Priorizar áreas de mejora',
        'acceso_requerido': 'gratuito',
        'fase_relacionada': 1,
        'nivel_dificultad': 'basico',
        'tags': ['diagnostico', 'niif', 's1', 's2', 'evaluacion'],
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
        'tags': ['template', 'excel', 'autoevaluacion', 'diagnostico'],
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
        'tags': ['video', 'introduccion', 'niif', 's1', 's2'],
        'publicado': True,
        'destacado': True
    },
    
    # Fase 2: Materialidad
    {
        'titulo': 'Guía de Análisis de Materialidad',
        'descripcion': 'Metodología para identificar temas ESG materiales',
        'tipo': 'guia',
        'categoria': 'materialidad',
        'contenido': '**Análisis de Materialidad Doble**\n\nEl análisis de materialidad es fundamental para identificar los temas de sostenibilidad más relevantes para tu organización.\n\n**1. Materialidad de Impacto**\n- Identificar impactos positivos y negativos\n- Evaluar significancia de los impactos\n- Considerar toda la cadena de valor\n\n**2. Materialidad Financiera**\n- Identificar riesgos y oportunidades\n- Evaluar impacto financiero potencial\n- Analizar horizonte temporal\n\n**3. Engagement con Stakeholders**\n- Identificar stakeholders clave\n- Metodologías de consulta\n- Priorización de temas',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 2,
        'nivel_dificultad': 'intermedio',
        'tags': ['materialidad', 'esg', 'stakeholders', 'analisis'],
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
        'tags': ['matriz', 'template', 'materialidad', 'excel'],
        'publicado': True,
        'destacado': False
    },
    {
        'titulo': 'Caso de Estudio: Análisis de Materialidad en Retail',
        'descripcion': 'Ejemplo real de cómo una empresa retail realizó su análisis',
        'tipo': 'caso_estudio',
        'categoria': 'materialidad',
        'contenido': '**Caso: Retailer Latinoamericano**\n\n**Contexto:**\nEmpresa con 150 tiendas en 5 países, 5,000 empleados.\n\n**Proceso:**\n1. Identificación de 25 temas potenciales\n2. Consulta con 500+ stakeholders\n3. Análisis de impactos en cadena de valor\n4. Priorización de 12 temas materiales\n\n**Temas Materiales Identificados:**\n- Emisiones de carbono (Scope 1, 2, 3)\n- Gestión de residuos\n- Condiciones laborales\n- Diversidad e inclusión\n- Economía circular',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 2,
        'nivel_dificultad': 'intermedio',
        'tags': ['caso', 'retail', 'ejemplo', 'materialidad'],
        'publicado': True,
        'destacado': False
    },
    
    # Fase 3: Riesgos
    {
        'titulo': 'Guía de Identificación de Riesgos Climáticos',
        'descripcion': 'Cómo identificar riesgos físicos y de transición',
        'tipo': 'guia',
        'categoria': 'riesgos',
        'contenido': '**Identificación de Riesgos Climáticos según TCFD**\n\n**Riesgos Físicos:**\n\n*Agudos:*\n- Eventos climáticos extremos\n- Inundaciones\n- Huracanes y tormentas\n- Incendios forestales\n\n*Crónicos:*\n- Aumento de temperaturas\n- Estrés hídrico\n- Cambios en patrones de precipitación\n\n**Riesgos de Transición:**\n\n*Políticos y legales:*\n- Regulaciones de carbono\n- Impuestos ambientales\n- Prohibiciones de productos\n\n*Tecnológicos:*\n- Obsolescencia tecnológica\n- Inversión en nuevas tecnologías\n\n*De mercado:*\n- Cambios en preferencias de consumo\n- Reputación corporativa',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 3,
        'nivel_dificultad': 'avanzado',
        'tags': ['riesgos', 'climaticos', 'tcfd', 'fisicos', 'transicion'],
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
        'tags': ['riesgos', 'matriz', 'template', 'evaluacion'],
        'publicado': True,
        'destacado': False
    },
    
    # Fase 4: Medición
    {
        'titulo': 'Guía de Cálculo de Huella de Carbono',
        'descripcion': 'Metodología completa para calcular emisiones Scope 1, 2 y 3',
        'tipo': 'guia',
        'categoria': 'medicion',
        'contenido': '**Cálculo de Huella de Carbono - Guía Completa**\n\n**Scope 1 - Emisiones Directas:**\n- Combustión estacionaria (calderas, generadores)\n- Combustión móvil (vehículos propios)\n- Emisiones fugitivas (refrigerantes, fugas)\n- Emisiones de proceso\n\n**Scope 2 - Emisiones Indirectas de Energía:**\n- Electricidad comprada\n- Vapor, calefacción y refrigeración comprados\n- Métodos: Location-based vs Market-based\n\n**Scope 3 - Otras Emisiones Indirectas:**\n- Bienes y servicios comprados\n- Transporte y distribución upstream\n- Viajes de negocios\n- Desplazamiento de empleados\n- Uso de productos vendidos\n- Tratamiento de residuos\n\n**Factores de Emisión:**\n- Bases de datos internacionales (IPCC, GHG Protocol)\n- Factores locales por país\n- Actualización anual',
        'autor': 'Equipo Clarisa',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 4,
        'nivel_dificultad': 'avanzado',
        'tags': ['huella', 'carbono', 'ghg', 'scope', 'emisiones'],
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
        'tags': ['calculadora', 'emisiones', 'tool', 'ghg'],
        'publicado': True,
        'destacado': True
    },
    {
        'titulo': 'Factores de Emisión 2024',
        'descripcion': 'Base de datos actualizada de factores de emisión',
        'tipo': 'articulo',
        'categoria': 'medicion',
        'contenido': '**Factores de Emisión Actualizados 2024**\n\n**Combustibles:**\n- Gasolina: 2.31 kg CO2e/litro\n- Diesel: 2.68 kg CO2e/litro\n- Gas natural: 1.95 kg CO2e/m³\n- GLP: 3.00 kg CO2e/kg\n\n**Electricidad (Latinoamérica):**\n- México: 0.458 kg CO2e/kWh\n- Colombia: 0.164 kg CO2e/kWh\n- Chile: 0.421 kg CO2e/kWh\n- Argentina: 0.357 kg CO2e/kWh\n- Brasil: 0.097 kg CO2e/kWh\n- Perú: 0.283 kg CO2e/kWh\n\n**Transporte:**\n- Vuelo doméstico: 0.255 kg CO2e/km\n- Vuelo internacional: 0.195 kg CO2e/km\n- Automóvil: 0.171 kg CO2e/km',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 4,
        'nivel_dificultad': 'avanzado',
        'tags': ['factores', 'emisiones', 'datos', 'referencia'],
        'publicado': True,
        'destacado': False
    },
    
    # Fase 5: Reporte
    {
        'titulo': 'Template de Reporte NIIF S1',
        'descripcion': 'Plantilla completa para tu reporte de sostenibilidad S1',
        'tipo': 'template',
        'categoria': 'reporte',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 5,
        'nivel_dificultad': 'avanzado',
        'tags': ['reporte', 's1', 'template', 'sostenibilidad'],
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
        'tags': ['reporte', 's2', 'template', 'clima'],
        'publicado': True,
        'destacado': True
    },
    {
        'titulo': 'Guía de Divulgación y Comunicación',
        'descripcion': 'Mejores prácticas para comunicar tu desempeño ESG',
        'tipo': 'guia',
        'categoria': 'reporte',
        'contenido': '**Guía de Divulgación y Comunicación ESG**\n\n**Principios de Divulgación:**\n1. **Claridad:** Lenguaje accesible y comprensible\n2. **Comparabilidad:** Uso de métricas estándar\n3. **Completitud:** Cobertura de todos los temas materiales\n4. **Consistencia:** Coherencia en el tiempo\n5. **Verificabilidad:** Información respaldada por evidencia\n\n**Canales de Comunicación:**\n- Reporte de sostenibilidad anual\n- Sección ESG en sitio web\n- Presentaciones a inversionistas\n- Redes sociales corporativas\n- Participación en índices ESG\n\n**Mejores Prácticas:**\n- Balance entre logros y desafíos\n- Inclusión de datos cuantitativos\n- Casos de estudio concretos\n- Metas y compromisos claros\n- Verificación externa de datos clave',
        'acceso_requerido': 'pagado',
        'fase_relacionada': 5,
        'nivel_dificultad': 'intermedio',
        'tags': ['divulgacion', 'comunicacion', 'esg', 'reporte'],
        'publicado': True,
        'destacado': False
    },
    
    # Recursos Generales
    {
        'titulo': 'Glosario de Términos ESG',
        'descripcion': 'Diccionario completo de términos de sostenibilidad',
        'tipo': 'articulo',
        'categoria': 'general',
        'contenido': '**Glosario de Términos ESG y Sostenibilidad**\n\n**A**\n- **Análisis de Materialidad:** Proceso para identificar temas ESG más relevantes\n- **Alcance (Scope):** Categorías de emisiones GEI (1, 2, 3)\n\n**C**\n- **Carbono Neutral:** Balance cero entre emisiones y remociones\n- **CDP:** Organización global de divulgación ambiental\n\n**E**\n- **ESG:** Environmental, Social, Governance (Ambiental, Social, Gobernanza)\n- **Emisiones GEI:** Gases de efecto invernadero\n\n**G**\n- **GRI:** Global Reporting Initiative\n- **GHG Protocol:** Estándar internacional para contabilidad de GEI\n\n**N**\n- **NIIF S1:** Requisitos Generales para Divulgación de Sostenibilidad\n- **NIIF S2:** Divulgaciones relacionadas con el Clima\n\n**S**\n- **Scope 1, 2, 3:** Categorías de emisiones de carbono\n- **Sostenibilidad:** Desarrollo que satisface necesidades actuales sin comprometer futuras generaciones\n\n**T**\n- **TCFD:** Task Force on Climate-related Financial Disclosures',
        'acceso_requerido': 'gratuito',
        'fase_relacionada': None,
        'nivel_dificultad': 'basico',
        'tags': ['glosario', 'terminos', 'esg', 'definiciones'],
        'publicado': True,
        'destacado': False
    },
    {
        'titulo': 'FAQ - Preguntas Frecuentes NIIF S1/S2',
        'descripcion': 'Respuestas a las preguntas más comunes',
        'tipo': 'articulo',
        'categoria': 'general',
        'contenido': '**Preguntas Frecuentes sobre NIIF S1/S2**\n\n**¿Qué son los estándares NIIF de sostenibilidad?**\nSon estándares internacionales desarrollados por el ISSB (International Sustainability Standards Board) para divulgar información relacionada con sostenibilidad que sea útil para los inversionistas.\n\n**¿Cuál es la diferencia entre NIIF S1 y S2?**\n- S1: Requisitos generales (estructura, gobernanza, estrategia, métricas)\n- S2: Específico para divulgaciones climáticas\n\n**¿Quién debe aplicar estos estándares?**\nInicialmente empresas con valores listados en bolsa, pero se espera adopción más amplia.\n\n**¿Cuándo entran en vigor?**\nDepende de la jurisdicción. Muchos países adoptan para períodos fiscales que inician en 2024-2025.\n\n**¿Son obligatorios?**\nDepende del país. Algunos los adoptan como obligatorios, otros como voluntarios.\n\n**¿Cómo empezar?**\n1. Realizar diagnóstico inicial\n2. Análisis de materialidad\n3. Identificar riesgos y oportunidades\n4. Establecer procesos de medición\n5. Implementar sistemas de reporte',
        'acceso_requerido': 'gratuito',
        'fase_relacionada': None,
        'nivel_dificultad': 'basico',
        'tags': ['faq', 'preguntas', 'niif', 's1', 's2'],
        'publicado': True,
        'destacado': True
    }
]

def insertar_recursos():
    """Insertar recursos en Supabase"""
    print("=" * 80)
    print("INSERTANDO RECURSOS EN SUPABASE")
    print("=" * 80)
    
    exitosos = 0
    errores = 0
    
    for recurso in recursos_data:
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
                print(f"✅ {recurso['titulo']}")
                exitosos += 1
            else:
                print(f"❌ {recurso['titulo']}: {response.status_code}")
                errores += 1
                
        except Exception as e:
            print(f"❌ {recurso['titulo']}: {str(e)}")
            errores += 1
    
    print("\n" + "=" * 80)
    print(f"✅ Recursos insertados exitosamente: {exitosos}")
    if errores > 0:
        print(f"❌ Errores: {errores}")
    print("=" * 80)

if __name__ == "__main__":
    insertar_recursos()
