"""
Supabase Storage Client
Maneja todas las operaciones de archivos en Supabase Storage
"""
import os
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
STORAGE_BUCKET = os.environ.get('STORAGE_BUCKET', 'recursos-clarisa')

class StorageClient:
    """Cliente singleton para Supabase Storage"""
    
    _instance = None
    _client: Client = None
    _bucket_name = STORAGE_BUCKET
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StorageClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Inicializa el cliente de Supabase"""
        try:
            self._client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Storage client initialized successfully")
            self._ensure_bucket_exists()
        except Exception as e:
            logger.error(f"Failed to initialize storage client: {e}")
            raise
    
    def _ensure_bucket_exists(self):
        """Asegura que el bucket existe, si no lo crea"""
        try:
            buckets = self._client.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            
            if self._bucket_name not in bucket_names:
                logger.info(f"Creating bucket: {self._bucket_name}")
                self._client.storage.create_bucket(
                    self._bucket_name,
                    options={
                        "public": True,
                        "file_size_limit": 52428800,  # 50MB
                        "allowed_mime_types": [
                            "image/jpeg", "image/png", "image/gif", "image/webp",
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "video/mp4", "video/mpeg", "video/quicktime"
                        ]
                    }
                )
                logger.info(f"Bucket {self._bucket_name} created successfully")
        except Exception as e:
            logger.warning(f"Error ensuring bucket exists: {e}")
    
    def upload_file(self, file_path: str, file_content: bytes, content_type: str = None) -> dict:
        """
        Sube un archivo al storage
        
        Args:
            file_path: Ruta del archivo en el bucket
            file_content: Contenido del archivo en bytes
            content_type: Tipo MIME del archivo
            
        Returns:
            dict con información del archivo subido
        """
        try:
            options = {"upsert": False}
            if content_type:
                options["content-type"] = content_type
            
            response = self._client.storage.from_(self._bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options=options
            )
            
            public_url = self.get_public_url(file_path)
            
            logger.info(f"File uploaded successfully: {file_path}")
            return {
                "success": True,
                "path": file_path,
                "url": public_url
            }
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            if "already exists" in str(e).lower():
                raise ValueError(f"File {file_path} already exists")
            raise
    
    def get_public_url(self, file_path: str) -> str:
        """Obtiene la URL pública de un archivo"""
        try:
            response = self._client.storage.from_(self._bucket_name).get_public_url(file_path)
            
            if isinstance(response, dict):
                return response.get("publicUrl", "")
            return response
        except Exception as e:
            logger.error(f"Error getting public URL: {e}")
            return ""
    
    def delete_file(self, file_path: str) -> bool:
        """Elimina un archivo del storage"""
        try:
            self._client.storage.from_(self._bucket_name).remove([file_path])
            logger.info(f"File deleted successfully: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise
    
    def list_files(self, folder: str = "", limit: int = 100) -> list:
        """Lista archivos en una carpeta"""
        try:
            response = self._client.storage.from_(self._bucket_name).list(
                folder,
                options={"limit": limit, "sortBy": {"column": "name", "order": "asc"}}
            )
            return response
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return []

# Instancia singleton
storage_client = StorageClient()
