import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/admin/FileUpload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EditarRecursoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'guia',
    categoria: 'diagnostico',
    contenido: '',
    url_externo: '',
    archivo_url: '',
    autor: '',
    duracion_minutos: '',
    nivel_dificultad: 'basico',
    tags: '',
    acceso_requerido: 'gratuito',
    fase_relacionada: '',
    publicado: true,
    destacado: false,
  });

  useEffect(() => {
    fetchRecurso();
  }, [id]);

  const fetchRecurso = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/recursos/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          tipo: data.tipo || 'guia',
          categoria: data.categoria || 'diagnostico',
          contenido: data.contenido || '',
          url_externo: data.url_externo || '',
          archivo_url: data.archivo_url || '',
          autor: data.autor || '',
          duracion_minutos: data.duracion_minutos || '',
          nivel_dificultad: data.nivel_dificultad || 'basico',
          tags: data.tags ? data.tags.join(', ') : '',
          acceso_requerido: data.acceso_requerido || 'gratuito',
          fase_relacionada: data.fase_relacionada || '',
          publicado: data.publicado !== false,
          destacado: data.destacado === true,
        });
      } else {
        toast.error('Recurso no encontrado');
        navigate('/admin/recursos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar recurso');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (url, filePath) => {
    setFormData(prev => ({ ...prev, archivo_url: url || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descripcion) {
      toast.error('Título y descripción son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        duracion_minutos: formData.duracion_minutos ? parseInt(formData.duracion_minutos) : null,
        fase_relacionada: formData.fase_relacionada ? parseInt(formData.fase_relacionada) : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      };

      const response = await fetch(`${BACKEND_URL}/api/admin/recursos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Recurso actualizado correctamente');
        navigate('/admin/recursos');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al actualizar recurso');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar recurso');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#4CAF50]"></div>
            <p className="mt-4 text-gray-600">Cargando recurso...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/admin/recursos')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Recurso</h1>
          <p className="mt-2 text-gray-600">Actualiza la información del recurso</p>
        </div>

        {/* Form - Igual que CrearRecursoPage pero con datos pre-cargados */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="guia">Guía</option>
                    <option value="template">Plantilla</option>
                    <option value="video">Video</option>
                    <option value="articulo">Artículo</option>
                    <option value="herramienta">Herramienta</option>
                    <option value="caso_estudio">Caso de Estudio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="diagnostico">Diagnóstico</option>
                    <option value="materialidad">Materialidad</option>
                    <option value="riesgos">Riesgos</option>
                    <option value="medicion">Medición</option>
                    <option value="reporte">Reporte</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                  <select
                    name="nivel_dificultad"
                    value={formData.nivel_dificultad}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                  <select
                    name="fase_relacionada"
                    value={formData.fase_relacionada}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="">General (sin fase)</option>
                    <option value="1">Fase 1</option>
                    <option value="2">Fase 2</option>
                    <option value="3">Fase 3</option>
                    <option value="4">Fase 4</option>
                    <option value="5">Fase 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Acceso</label>
                  <select
                    name="acceso_requerido"
                    value={formData.acceso_requerido}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="gratuito">Gratuito</option>
                    <option value="pagado">Pagado</option>
                    <option value="todos">Todos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido del Recurso
                </label>
                <textarea
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50] font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Externa (opcional)
                </label>
                <input
                  type="url"
                  name="url_externo"
                  value={formData.url_externo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>
            </div>
          </div>

          {/* Archivo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Archivo Adjunto</h2>
            <FileUpload 
              onUploadComplete={handleFileUpload}
              existingFileUrl={formData.archivo_url}
            />
          </div>

          {/* Metadatos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadatos</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    name="duracion_minutos"
                    value={formData.duracion_minutos}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="publicado"
                    checked={formData.publicado}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm font-medium text-gray-700">Publicar recurso</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm font-medium text-gray-700">Marcar como destacado ⭐</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <Button
              type="button"
              onClick={() => navigate('/admin/recursos')}
              variant="outline"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditarRecursoPage;
