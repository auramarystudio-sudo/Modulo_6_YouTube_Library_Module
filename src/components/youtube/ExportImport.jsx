// ============================================
// ExportImport.jsx - Exportar/Importar biblioteca
// Soporta JSON y CSV
// ============================================

import { useState, useRef } from 'react';
import { 
  X, Download, Upload, FileJson, FileSpreadsheet, 
  AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { exportarJSON, exportarCSV, descargarArchivo } from '../../utils/youtube-utils';
import { importarVideos } from '../../utils/pb-service';

export default function ExportImport({ videos, onImportar, onClose }) {
  const [tab, setTab] = useState('export');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Exportar como JSON
  const handleExportJSON = () => {
    const contenido = exportarJSON(videos);
    const fecha = new Date().toISOString().split('T')[0];
    descargarArchivo(contenido, `youtube-library-${fecha}.json`, 'application/json');
  };

  // Exportar como CSV
  const handleExportCSV = () => {
    const contenido = exportarCSV(videos);
    const fecha = new Date().toISOString().split('T')[0];
    descargarArchivo(contenido, `youtube-library-${fecha}.csv`, 'text/csv');
  };

  // Importar archivo
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setError('');
    setResultado(null);

    try {
      const text = await file.text();
      
      // Detectar formato
      let videosImportados = [];
      
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        // Soporta tanto formato directo como con wrapper
        videosImportados = Array.isArray(data) ? data : (data.videos || []);
      } else if (file.name.endsWith('.csv')) {
        videosImportados = parsearCSV(text);
      } else {
        throw new Error('Formato no soportado. Usa JSON o CSV.');
      }

      if (videosImportados.length === 0) {
        throw new Error('No se encontraron videos en el archivo.');
      }

      // Importar videos
      const resultados = await importarVideos(videosImportados);
      const exitosos = resultados.filter(r => r.success).length;
      
      setResultado({
        total: videosImportados.length,
        exitosos,
        fallidos: videosImportados.length - exitosos
      });

      if (onImportar) onImportar();
      
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo');
    } finally {
      setImportando(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Parsear CSV simple
  const parsearCSV = (csv) => {
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const videos = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const video = {};
      
      headers.forEach((header, idx) => {
        const val = values[idx]?.replace(/^"|"$/g, '') || '';
        switch (header.toLowerCase()) {
          case 'video id': video.video_id = val; break;
          case 'título': case 'titulo': video.titulo = val; break;
          case 'canal': video.canal = val; break;
          case 'url': video.url = val; break;
          case 'categoría': case 'categoria': video.categoria = val; break;
          case 'estado': video.estado = val || 'pendiente_ver'; break;
          case 'valoración': case 'valoracion': video.valoracion = parseInt(val) || 0; break;
          case 'duración': case 'duracion': video.duracion = val; break;
          case 'tags': video.tags = val ? val.split(',').map(t => t.trim()) : []; break;
          case 'fecha guardado': case 'fecha_guardado': video.fecha_guardado = val; break;
          case 'notas': video.notas_personales = val; break;
        }
      });
      
      if (video.video_id && video.titulo) {
        videos.push(video);
      }
    }
    
    return videos;
  };

  // Parser CSV que maneja comillas
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Exportar / Importar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/50">
          <button
            onClick={() => { setTab('export'); setError(''); setResultado(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
              tab === 'export' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => { setTab('import'); setError(''); setResultado(null); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
              tab === 'import' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {tab === 'export' && (
            <>
              <p className="text-sm text-slate-400">
                Descarga tu biblioteca completa como backup o para compartir.
              </p>
              <p className="text-xs text-slate-500">
                {videos.length} videos en la biblioteca
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportJSON}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition group"
                >
                  <FileJson className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-200">JSON</p>
                    <p className="text-xs text-slate-500">Completo con todos los datos</p>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-green-500/30 hover:bg-slate-800/50 transition group"
                >
                  <FileSpreadsheet className="w-8 h-8 text-green-400 group-hover:scale-110 transition" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-200">CSV</p>
                    <p className="text-xs text-slate-500">Compatible con Excel</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {tab === 'import' && (
            <>
              <p className="text-sm text-slate-400">
                Importa videos desde un archivo JSON o CSV previamente exportado.
              </p>

              {/* Área de drop/upload */}
              <label className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 bg-slate-800/20 hover:bg-slate-800/30 transition cursor-pointer">
                {importando ? (
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-slate-500" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">
                    {importando ? 'Procesando...' : 'Haz click o arrastra un archivo'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos: .json, .csv
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-800/30 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Resultado */}
              {resultado && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {resultado.exitosos} de {resultado.total} videos importados
                    {resultado.fallidos > 0 && ` (${resultado.fallidos} errores)`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
