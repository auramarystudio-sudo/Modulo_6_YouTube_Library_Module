// ============================================
// ChannelFeed.jsx - Feed de canales suscritos
// Muestra últimos videos de canales frecuentes
// ============================================

import { useState, useEffect } from 'react';
import { 
  X, Radio, ExternalLink, TrendingUp, 
  User, Calendar, Loader2
} from 'lucide-react';
import { generarThumbnail, generarURLVideo } from '../../utils/youtube-utils';

export default function ChannelFeed({ videos, onClose }) {
  const [canales, setCanales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [canalSeleccionado, setCanalSeleccionado] = useState(null);

  // Analizar canales más frecuentes
  useEffect(() => {
    const canalStats = {};
    
    videos.forEach(video => {
      if (!video.canal) return;
      
      if (!canalStats[video.canal]) {
        canalStats[video.canal] = {
          nombre: video.canal,
          cantidad: 0,
          videos: [],
          ultimaFecha: null
        };
      }
      
      canalStats[video.canal].cantidad++;
      canalStats[video.canal].videos.push(video);
      
      const fecha = new Date(video.fecha_guardado);
      if (!canalStats[video.canal].ultimaFecha || fecha > canalStats[video.canal].ultimaFecha) {
        canalStats[video.canal].ultimaFecha = fecha;
      }
    });
    
    // Convertir a array y ordenar por cantidad
    const canalesArray = Object.values(canalStats)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 20); // Top 20 canales
    
    setCanales(canalesArray);
    setCargando(false);
  }, [videos]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const ahora = new Date();
    const diff = ahora - fecha;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
  };

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative flex items-center gap-3 p-6 bg-slate-900/95 border border-slate-800/50 rounded-2xl">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          <p className="text-slate-300">Analizando canales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400" />
            Feed de Canales
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {canales.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No hay canales analizados aún</p>
              <p className="text-xs text-slate-600 mt-1">Añade videos para ver tus canales frecuentes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canales.map((canal, idx) => (
                <div
                  key={canal.nombre}
                  className={`bg-slate-800/30 border rounded-xl p-4 transition cursor-pointer ${
                    canalSeleccionado === canal.nombre
                      ? 'border-cyan-500/50 bg-cyan-950/20'
                      : 'border-slate-700/30 hover:border-slate-600/50'
                  }`}
                  onClick={() => setCanalSeleccionado(canalSeleccionado === canal.nombre ? null : canal.nombre)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-200 truncate">
                        {canal.nombre}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {canal.cantidad} videos
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatearFecha(canal.ultimaFecha)}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-700">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Videos del canal (expandido) */}
                  {canalSeleccionado === canal.nombre && (
                    <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-2">
                      <p className="text-xs text-slate-500 mb-2">Últimos videos guardados:</p>
                      {canal.videos.slice(0, 5).map(video => (
                        <a
                          key={video.id}
                          href={video.url || generarURLVideo(video.video_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition group"
                        >
                          <img
                            src={video.thumbnail || generarThumbnail(video.video_id, 'mq')}
                            alt=""
                            className="w-16 h-9 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 truncate group-hover:text-white transition">
                              {video.titulo}
                            </p>
                            <p className="text-[10px] text-slate-600">
                              {video.fecha_guardado}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
