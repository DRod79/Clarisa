import React, { useState, useEffect } from 'react';
import ClientLayout from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Rocket,
  Filter,
  BarChart,
  Settings,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  Rocket: Rocket,
  Search: Search,
  Filter: Filter,
  BarChart: BarChart,
  Settings: Settings,
  CreditCard: CreditCard,
};

const AyudaPage = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (categoriaActiva !== 'all') {
      fetchFaqs(categoriaActiva);
    } else {
      fetchFaqs();
    }
  }, [categoriaActiva]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ayuda/categorias`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFaqs = async (categoriaId = null, search = null) => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/api/ayuda/faqs`;
      const params = new URLSearchParams();
      
      if (categoriaId) params.append('categoria_id', categoriaId);
      if (search) params.append('search', search);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchFaqs(null, searchTerm);
      setCategoriaActiva('all');
    } else {
      fetchFaqs();
    }
  };

  const toggleFaq = async (faqId) => {
    if (expandedFaq !== faqId) {
      // Registrar vista
      try {
        await fetch(`${BACKEND_URL}/api/ayuda/faqs/${faqId}/registrar-vista`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error registrando vista:', error);
      }
    }
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handleValorar = async (faqId, util) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ayuda/faqs/${faqId}/valorar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ util }),
      });

      if (response.ok) {
        toast.success(util ? '¡Gracias por tu valoración!' : 'Gracias por tu feedback');
        // Actualizar el FAQ localmente
        setFaqs(faqs.map(faq => {
          if (faq.id === faqId) {
            return {
              ...faq,
              [util ? 'util_si' : 'util_no']: (faq[util ? 'util_si' : 'util_no'] || 0) + 1
            };
          }
          return faq;
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar valoración');
    }
  };

  const filteredFaqs = faqs;

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💬 Centro de Ayuda</h1>
        <p className="mt-2 text-gray-600">
          Encuentra respuestas a tus preguntas sobre NIIF S1/S2
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white px-8"
          >
            Buscar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setCategoriaActiva('all');
                  setSearchTerm('');
                }}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  categoriaActiva === 'all'
                    ? 'bg-[#4CAF50] text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Todas</span>
                </div>
              </button>

              {categorias.map((cat) => {
                const Icon = iconMap[cat.icono] || HelpCircle;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoriaActiva(cat.id);
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      categoriaActiva === cat.id
                        ? 'bg-[#4CAF50] text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{cat.nombre}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        categoriaActiva === cat.id
                          ? 'bg-white/20'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {cat.faqs_count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contact Support */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-medium mb-2">
                ¿No encuentras lo que buscas?
              </p>
              <Button
                onClick={() => navigate('/app/soporte')}
                variant="outline"
                size="sm"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Crear Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - FAQs */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#4CAF50]"></div>
              <p className="mt-4 text-gray-600">Cargando preguntas...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron preguntas
              </h3>
              <p className="text-gray-600 mb-4">
                Intenta con otros términos de búsqueda o navega por las categorías
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setCategoriaActiva('all');
                  fetchFaqs();
                }}
                variant="outline"
              >
                Ver todas las preguntas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-6 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {faq.pregunta}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{faq.vistas || 0} vistas</span>
                          {(faq.util_si > 0 || faq.util_no > 0) && (
                            <span>
                              {Math.round((faq.util_si / (faq.util_si + faq.util_no)) * 100)}% útil
                            </span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="border-t pt-4">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {faq.respuesta}
                          </p>

                          <div className="mt-6 pt-4 border-t flex items-center justify-between">
                            <p className="text-sm text-gray-600">¿Te resultó útil esta respuesta?</p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleValorar(faq.id, true)}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Sí ({faq.util_si || 0})
                              </Button>
                              <Button
                                onClick={() => handleValorar(faq.id, false)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                No ({faq.util_no || 0})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default AyudaPage;
