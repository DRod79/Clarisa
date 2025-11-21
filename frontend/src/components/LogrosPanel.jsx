import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import { Trophy, TrendingUp, Star, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LogrosPanel = () => {
  const { userData } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.id) {
      cargarDatos();
    }
  }, [userData]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [statsRes, logrosRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/gamificacion/usuario/${userData.id}/estadisticas`),
        fetch(`${BACKEND_URL}/api/gamificacion/usuario/${userData.id}/logros`)
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEstadisticas(statsData);
      }
      
      if (logrosRes.ok) {
        const logrosData = await logrosRes.json();
        setLogros(logrosData.logros || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const getNivelInfo = (nivel) => {
    const niveles = {
      1: { color: 'bg-gray-100 text-gray-800', nombre: 'Principiante' },
      2: { color: 'bg-blue-100 text-blue-800', nombre: 'Aprendiz' },
      3: { color: 'bg-green-100 text-green-800', nombre: 'Competente' },
      4: { color: 'bg-purple-100 text-purple-800', nombre: 'Experto' },
      5: { color: 'bg-yellow-100 text-yellow-800', nombre: 'Maestro' }
    };
    return niveles[nivel] || niveles[1];
  };

  const nivelInfo = getNivelInfo(estadisticas.nivel);

  return (
    <div className="space-y-4">
      {/* Card de Nivel y Puntos */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-semibold">Nivel {estadisticas.nivel}</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${nivelInfo.color}`}>
                {nivelInfo.nombre}
              </span>
            </div>
            <p className="text-3xl font-bold">{estadisticas.puntos_totales} puntos</p>
            <p className="text-sm opacity-90 mt-1">
              {estadisticas.logros_obtenidos} de {estadisticas.logros_totales} logros desbloqueados
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold opacity-20">
              <Award className="w-20 h-20" />
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Progreso de logros</span>
            <span>{estadisticas.progreso_porcentaje}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${estadisticas.progreso_porcentaje}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{estadisticas.recursos_vistos}</p>
          <p className="text-xs text-gray-600">Recursos vistos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{estadisticas.recursos_favoritos}</p>
          <p className="text-xs text-gray-600">Favoritos</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{estadisticas.logros_obtenidos}</p>
          <p className="text-xs text-gray-600">Logros</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{estadisticas.tickets_creados}</p>
          <p className="text-xs text-gray-600">Tickets</p>
        </div>
      </div>

      {/* Logros Recientes */}
      {logros.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#4CAF50]" />
            Logros Desbloqueados
          </h3>
          <div className="space-y-3">
            {logros.slice(0, 5).map((logro, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl">{logro.icono}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{logro.titulo}</p>
                  <p className="text-sm text-gray-600">{logro.descripcion}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#4CAF50]">+{logro.puntos}</p>
                  <p className="text-xs text-gray-500">puntos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogrosPanel;
