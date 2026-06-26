import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Search, Eye, ClipboardList, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Etiquetas legibles de cada pregunta del diagnóstico
const PREGUNTAS = {
  p1_sector: '1. Sector',
  p2_tamano: '2. Tamaño de la organización',
  p3_motivacion: '3. Motivación principal',
  p4_plazo: '4. Plazo para el primer informe',
  p5_publica_info: '5. ¿Publica información de sostenibilidad?',
  p6_materialidad: '6. Análisis de materialidad',
  p7_familiaridad: '7. Familiaridad con las normas',
  p8_riesgos_clima: '8. Riesgos climáticos',
  p9_huella_carbono: '9. Huella de carbono',
  p10_liderazgo: '10. Liderazgo de sostenibilidad',
  p11_junta: '11. Supervisión de la Junta',
  p12_personas_dedicadas: '12. Personas dedicadas',
  p13_presupuesto: '13. Presupuesto asignado',
  p14_recopilacion: '14. Recopilación de datos',
  p15_control_interno: '15. Control interno',
  p16_datos_auditables: '16. Datos auditables',
  p17_rastreo_impacto: '17. Rastreo de impacto',
  p18_obstaculo: '18. Mayor obstáculo',
  p19_apoyo_valioso: '19. Apoyo más valioso',
};

const fmtFecha = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const DiagnosticosAdminPage = () => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/diagnosticos`);
      const lista = Array.isArray(data) ? data : [];
      lista.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setDiagnosticos(lista);
    } catch (e) {
      console.error('Error cargando diagnósticos:', e);
      toast.error('No se pudieron cargar los diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return diagnosticos;
    return diagnosticos.filter((d) =>
      [d.nombre_completo, d.email, d.organizacion, d.scoring?.arquetipo?.codigo, d.scoring?.arquetipo?.nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [diagnosticos, query]);

  const exportarCSV = () => {
    if (filtrados.length === 0) {
      toast.error('No hay diagnósticos para exportar');
      return;
    }

    const headers = [
      'Fecha',
      'Nombre',
      'Email',
      'Teléfono',
      'Organización',
      'Puesto',
      'País',
      'Departamento',
      'Años experiencia',
      'Arquetipo (código)',
      'Arquetipo (nombre)',
      'Recomendación',
      'Urgencia',
      'Madurez',
      'Capacidad',
      ...Object.values(PREGUNTAS),
    ];

    const escapar = (val) => {
      const s = Array.isArray(val) ? val.join(' | ') : val == null ? '' : String(val);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const filas = filtrados.map((d) => {
      const base = [
        fmtFecha(d.timestamp),
        d.nombre_completo,
        d.email,
        d.telefono,
        d.organizacion,
        d.puesto,
        d.pais,
        d.departamento,
        d.anios_experiencia,
        d.scoring?.arquetipo?.codigo,
        d.scoring?.arquetipo?.nombre,
        d.scoring?.arquetipo?.recomendacion,
        d.scoring?.urgencia?.puntos,
        d.scoring?.madurez?.puntos,
        d.scoring?.capacidad?.puntos,
      ];
      const respuestas = Object.keys(PREGUNTAS).map((k) => d[k]);
      return [...base, ...respuestas].map(escapar).join(',');
    });

    const csv = '\uFEFF' + [headers.map(escapar).join(','), ...filas].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnosticos_clarisa_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtrados.length} diagnóstico(s) exportado(s)`);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-testid="diagnosticos-admin-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#4CAF50]" />
            Diagnósticos recibidos
          </h1>
          <p className="mt-2 text-gray-600">
            Leads que completaron el diagnóstico NIIF S1/S2 — {diagnosticos.length} en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargar}
            data-testid="refresh-diagnosticos-button"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button
            onClick={exportarCSV}
            data-testid="export-csv-button"
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, email, empresa o arquetipo..."
          className="pl-9"
          data-testid="search-diagnosticos-input"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500" data-testid="diagnosticos-loading">
            Cargando diagnósticos...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500" data-testid="diagnosticos-empty">
            No hay diagnósticos {query ? 'que coincidan con la búsqueda' : 'registrados todavía'}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" data-testid="diagnosticos-table">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Nombre', 'Empresa', 'Email', 'Arquetipo', 'U / M / C', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrados.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50" data-testid={`diagnostico-row-${d.id}`}>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fmtFecha(d.timestamp)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.nombre_completo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.organizacion || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{d.email || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#2D5F3F]">
                        {d.scoring?.arquetipo?.codigo || '?'} · {d.scoring?.arquetipo?.nombre || 'N/D'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {d.scoring?.urgencia?.puntos ?? '–'} / {d.scoring?.madurez?.puntos ?? '–'} / {d.scoring?.capacidad?.puntos ?? '–'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(d)}
                        data-testid={`view-diagnostico-${d.id}`}
                        className="text-[#4CAF50] hover:text-[#2D5F3F]"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="diagnostico-detail-dialog">
          <DialogHeader>
            <DialogTitle>Diagnóstico — {selected?.nombre_completo}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 text-sm">
              {/* Contacto */}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Email:</span> {selected.email}</div>
                <div><span className="text-gray-500">Teléfono:</span> {selected.telefono}</div>
                <div><span className="text-gray-500">Empresa:</span> {selected.organizacion}</div>
                <div><span className="text-gray-500">Puesto:</span> {selected.puesto}</div>
                <div><span className="text-gray-500">País:</span> {selected.pais}</div>
                <div><span className="text-gray-500">Departamento:</span> {selected.departamento}</div>
                <div><span className="text-gray-500">Fecha:</span> {fmtFecha(selected.timestamp)}</div>
              </div>

              {/* Resultado */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-[#2D5F3F]">
                  Arquetipo {selected.scoring?.arquetipo?.codigo}: {selected.scoring?.arquetipo?.nombre}
                </p>
                <p className="text-gray-600 mt-1">{selected.scoring?.arquetipo?.descripcion}</p>
                <p className="text-gray-800 mt-2"><strong>Recomendación:</strong> {selected.scoring?.arquetipo?.recomendacion}</p>
                <div className="flex gap-4 mt-3 text-xs">
                  <span>Urgencia: <strong>{selected.scoring?.urgencia?.puntos}</strong> ({selected.scoring?.urgencia?.nivel})</span>
                  <span>Madurez: <strong>{selected.scoring?.madurez?.puntos}</strong> ({selected.scoring?.madurez?.nivel})</span>
                  <span>Capacidad: <strong>{selected.scoring?.capacidad?.puntos}</strong> ({selected.scoring?.capacidad?.nivel})</span>
                </div>
              </div>

              {/* Respuestas */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Respuestas</h4>
                {Object.entries(PREGUNTAS).map(([k, label]) => (
                  <div key={k} className="border-b border-gray-100 pb-2">
                    <p className="text-gray-500">{label}</p>
                    <p className="text-gray-900">
                      {Array.isArray(selected[k]) ? selected[k].join(', ') : selected[k] || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DiagnosticosAdminPage;
