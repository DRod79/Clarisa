from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Scoring Models
class ScoringDimension(BaseModel):
    puntos: int
    nivel: str
    categoria: str

class Arquetipo(BaseModel):
    codigo: str
    nombre: str
    descripcion: str
    recomendacion: str

class Scoring(BaseModel):
    urgencia: ScoringDimension
    madurez: ScoringDimension
    capacidad: ScoringDimension
    arquetipo: Arquetipo

# Diagnostico Models
class DiagnosticoSubmission(BaseModel):
    # Contacto y Perfil
    nombre_completo: str
    email: EmailStr
    telefono: Optional[str] = None
    organizacion: str
    puesto: str
    pais: str
    departamento: str
    anios_experiencia: str
    
    # Contexto (P1-P4)
    p1_sector: str
    p2_tamano: str
    p3_motivacion: str
    p4_plazo: str
    
    # Madurez (P5-P9)
    p5_publica_info: str
    p6_materialidad: str
    p7_familiaridad: str
    p8_riesgos_clima: str
    p9_huella_carbono: str
    
    # Gobernanza (P10-P13)
    p10_liderazgo: str
    p11_junta: str
    p12_personas_dedicadas: str
    p13_presupuesto: str
    
    # Datos (P14-P17)
    p14_recopilacion: str
    p15_control_interno: str
    p16_datos_auditables: str
    p17_rastreo_impacto: str
    
    # Necesidades (P18-P20)
    p18_obstaculo: str
    p19_apoyo_valioso: List[str]
    p20_inversion: str
    
    # Scoring (calculado en frontend)
    scoring: Scoring
    
    # Metadata
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class DiagnosticoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    mensaje: str
    timestamp: str
    scoring: Scoring


# Routes
@api_router.get("/")
async def root():
    return {"message": "Clarisa API - Implementación NIIF S1/S2"}


@api_router.post("/diagnostico", response_model=DiagnosticoResponse)
async def submit_diagnostico(diagnostico: DiagnosticoSubmission):
    try:
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = diagnostico.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        # Convert scoring to dict for MongoDB
        doc['scoring'] = {
            'urgencia': diagnostico.scoring.urgencia.model_dump(),
            'madurez': diagnostico.scoring.madurez.model_dump(),
            'capacidad': diagnostico.scoring.capacidad.model_dump(),
            'arquetipo': diagnostico.scoring.arquetipo.model_dump()
        }
        
        # Save to MongoDB
        result = await db.diagnosticos.insert_one(doc)
        
        logger.info(f"Diagnóstico guardado: {diagnostico.email} - {diagnostico.organizacion} - Arquetipo: {diagnostico.scoring.arquetipo.codigo}")
        
        return DiagnosticoResponse(
            id=diagnostico.id,
            mensaje="Diagnóstico recibido exitosamente. Recibirás tu informe en 48 horas.",
            timestamp=diagnostico.timestamp.isoformat(),
            scoring=diagnostico.scoring
        )
    except Exception as e:
        logger.error(f"Error guardando diagnóstico: {str(e)}")
        raise HTTPException(status_code=500, detail="Error procesando diagnóstico")


@api_router.get("/diagnostico/{diagnostico_id}")
async def get_diagnostico(diagnostico_id: str):
    diagnostico = await db.diagnosticos.find_one({"id": diagnostico_id}, {"_id": 0})
    if not diagnostico:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    return diagnostico


@api_router.get("/diagnosticos")
async def get_all_diagnosticos():
    diagnosticos = await db.diagnosticos.find({}, {"_id": 0}).to_list(1000)
    return diagnosticos


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()