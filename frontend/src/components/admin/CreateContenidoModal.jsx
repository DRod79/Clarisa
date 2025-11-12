import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const CreateContenidoModal = ({ isOpen, onClose, onSuccess, userData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'plantilla',
    titulo: '',
    descripcion: '',
    categoria: '',
    tags: '',
    nivel_acceso: 'gratuito',
    archivo_url: '',
    thumbnail_url: '',
    publicado: false,
  });
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validations
      if (!formData.titulo.trim()) {
        toast.error('El título es obligatorio');
        setLoading(false);
        return;
      }

      // Prepare tags array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      // Prepare data for Supabase
      const contenidoData = {
        tipo: formData.tipo,
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        categoria: formData.categoria || null,
        tags: tagsArray,
        nivel_acceso: formData.nivel_acceso,
        archivo_url: formData.archivo_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        publicado: formData.publicado,
        created_by: userData?.id || null,
        descargas: 0,
        vistas: 0,
        rating: 0,
      };

      console.log('Creating contenido with data:', contenidoData);

      // Insert into Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contenido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(contenidoData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al crear contenido: ${response.status}`);
      }

      const result = await response.json();
      console.log('Contenido created:', result);

      toast.success('Contenido creado exitosamente');
      
      // Reset form
      setFormData({
        tipo: 'plantilla',
        titulo: '',
        descripcion: '',
        categoria: '',
        tags: '',
        nivel_acceso: 'gratuito',
        archivo_url: '',
        thumbnail_url: '',
        publicado: false,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating contenido:', error);
      toast.error(error.message || 'Error al crear contenido');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Contenido</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de contenido *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="plantilla">Plantilla</option>
              <option value="guia">Guía</option>
              <option value="curso">Curso</option>
              <option value="articulo">Artículo</option>
              <option value="video">Video</option>
              <option value="herramienta">Herramienta</option>
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ej: Matriz de Materialidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Describe brevemente el contenido..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ej: Materialidad, Governance, Datos"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (separados por comas)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ej: NIIF S1, sostenibilidad, reporte"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          {/* Nivel de acceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de acceso *
            </label>
            <select
              name="nivel_acceso"
              value={formData.nivel_acceso}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <option value="gratuito">Gratuito</option>
              <option value="basico">Básico</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Upload method selector */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo del contenido
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">URL del archivo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Subir archivo (próximamente)</span>
              </label>
            </div>

            {uploadMethod === 'url' && (
              <input
                type="url"
                name="archivo_url"
                value={formData.archivo_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/archivo.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            )}

            {uploadMethod === 'file' && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Función de upload disponible próximamente
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Por ahora usa URL del archivo
                </p>
              </div>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de imagen (thumbnail)
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          {/* Publicar */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publicado"
              name="publicado"
              checked={formData.publicado}
              onChange={handleChange}
              className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
            />
            <label htmlFor="publicado" className="ml-2 text-sm text-gray-700">
              Publicar inmediatamente
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              {loading ? 'Creando...' : 'Crear Contenido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContenidoModal;
