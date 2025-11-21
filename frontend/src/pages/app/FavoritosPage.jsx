import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import ClientLayout from '@/layouts/ClientLayout';
import { Heart, Trash2, Eye, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FavoritosPage = () => {
  const { userData } = useAuth();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      cargarFavoritos();
    }
  }, [userData]);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/favoritos/${userData.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setFavoritos(data.favoritos || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const quitarFavorito = async (recursoId) => {
    if (!confirm('¿Quitar este recurso de favoritos?')) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/favoritos/${userData.id}/${recursoId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        toast.success('Recurso quitado de favoritos');
        cargarFavoritos();
      } else {
        toast.error('Error al quitar de favoritos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    }
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      articulo: 'bg-blue-100 text-blue-800',
      guia: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      template: 'bg-orange-100 text-orange-800',
      webinar: 'bg-pink-100 text-pink-800'
    };
    return badges[tipo] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Mis Favoritos
            </h1>
            <p className="text-gray-600 mt-1">
              {favoritos.length} recurso{favoritos.length !== 1 ? 's' : ''} guardado{favoritos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Lista de Favoritos */}
        {favoritos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos guardados
            </h3>
            <p className="text-gray-600 mb-6">
              Explora la biblioteca de recursos y guarda tus favoritos haciendo clic en el corazón
            </p>
            <a
              href="/app/recursos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
            >
              Explorar Recursos
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritos.map((recurso) => (
              <div
                key={recurso.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Badge de tipo */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTipoBadge(recurso.tipo)}`}>
                      {recurso.tipo}
                    </span>
                    <span className="text-xs text-gray-500">
                      Fase {recurso.fase}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                    {recurso.titulo}
                  </h3>
                </div>

                {/* Descripción */}
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {recurso.descripcion}
                  </p>

                  {/* Estadísticas */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {recurso.vistas || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {recurso.descargas || 0}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`/app/recursos?id=${recurso.id}`}
                      className="flex-1 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-center text-sm font-medium"
                    >
                      Ver Recurso
                    </a>
                    <button
                      onClick={() => quitarFavorito(recurso.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Fecha agregado */}
                <div className="px-4 py-2 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500">
                    Agregado: {new Date(recurso.agregado_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default FavoritosPage;
