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

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    telefono: str
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


# ============================================
# AUTH ENDPOINTS
# ============================================

from auth import (
    hash_password, 
    verify_password, 
    generate_session_token,
    create_user_in_supabase,
    get_user_by_email,
    get_user_by_id,
    update_user_last_access
)

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre_completo: str
    organizacion: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: dict
    session_token: str

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        # Create user data
        user_id = str(uuid.uuid4())
        user_data = {
            'id': user_id,
            'email': request.email,
            'password_hash': hashed_password,
            'nombre_completo': request.nombre_completo,
            'organizacion': request.organizacion or '',
            'rol': 'cliente_gratuito',
            'plan_actual': 'gratuito',
            'suscripcion_activa': False,
            'onboarding_completado': False,
            'progreso_general': 0,
            'fecha_registro': datetime.now(timezone.utc).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
        
        # Create user in Supabase
        created_user, error = await create_user_in_supabase(user_data)
        
        if error:
            logger.error(f"Error creating user in Supabase: {error}")
            raise HTTPException(status_code=500, detail=f"Error creating user: {error}")
        
        # Generate session token
        session_token = generate_session_token()
        
        # Remove password hash from response
        created_user.pop('password_hash', None)
        
        logger.info(f"User registered successfully: {request.email}")
        
        return {
            'user': created_user,
            'session_token': session_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in register: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user"""
    try:
        # Get user by email
        user = await get_user_by_email(request.email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user.get('password_hash', '')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last access
        await update_user_last_access(user['id'])
        
        # Generate session token
        session_token = generate_session_token()
        
        # Remove password hash from response
        user.pop('password_hash', None)
        
        logger.info(f"User logged in successfully: {request.email}")
        
        return {
            'user': user,
            'session_token': session_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user(user_id: str):
    """Get current user by ID"""
    try:
        user = await get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove password hash
        user.pop('password_hash', None)
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()