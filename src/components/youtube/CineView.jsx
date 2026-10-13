// ============================================
// CineView.jsx - Vista inmersiva con reproductor
// Reproductor embebido + notas + timestamps
// ============================================

import { useState } from 'react';
import { 
  X, Star, Clock, StickyNote, ExternalLink, 
  SkipBack, SkipForward, Bookmark, ChevronLeft, ChevronRight,
  Sparkles, Loader2
} from 'lucide-react';
import { 
  tiempoASegundos, ESTADOS, CATEGORIAS, generarResumenIA 
} from '../../utils/youtube-utils';

export default function CineView({ video, videosRelacionados = [], onClose, onEditar, onToggleFavorito, onResumirIA, onActualizarNotas }) {
  const [notasEdit, setNotasEdit] = useState(video.notas_personales || '');
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [resumenIA, setResumenIA] = useState(null);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [videoActual, setVideoActual] = useState(video);

  if (!videoActual) return null;

  const estadoConfig = ESTADOS[videoActual.estado] || ESTADOS.pendiente_ver;
  const categoriaConfig = CATEGORIAS[videoActual.categoria] || CATEGORIAS.otro;

  // Guardar notas
  const guardarNotas = () => {
    if (onActualizarNotas) {
      onActualizarNotas(videoActual.id, notasEdit);
    }
    setEditandoNotas(false);
  };

  // Generar resumen IA
  const handleResumirIA = async () => {
    setGenerandoResumen(true);
    try {
      const resumen = await generarResumenIA(videoActual);
      setResumenIA(resumen);
      if (onResumirIA) onResumirIA(videoActual.id, resumen);
    } catch (e) {
      console.error('Error generando resumen:', e);
    } finally {
      setGenerandoResumen(false);
    }
  };

  // Navegar entre videos relacionados
  const navegarVideo = (direccion) => {
    const idx = videosRelacionados.findIndex(v => v.id === videoActual.id);
    if (idx === -1) return;
    const nuevoIdx = idx + direccion;
    if (nuevoIdx >= 0 && nuevoIdx < videosRelacionados.length) {
      setVideoActual(videosRelacionados[nuevoIdx]);
      setNotasEdit(videosRelacionados[nuevoIdx].notas_personales || '');
      setResumenIA(null);
    }
  };

  const idxActual = videosRelacionados.findIndex(v => v.id === videoActual.id);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header flotante */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs px-2 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/30 backdrop-blur-sm">
            🎬 Modo Cine
          </span>
        </div>

        {/* Navegación */}
        {videosRelacionados.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navegarVideo(-1)}
              disabled={idxActual <= 0}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400">
              {idxActual + 1} / {videosRelacionados.length}
            </span>
            <button
              onClick={() => navegarVideo(1)}
              disabled={idxActual >= videosRelacionados.length - 1}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorito?.(videoActual)}
            className={`p-2 rounded-lg backdrop-blur-sm transition ${
              videoActual.estado === 'favorito' 
                ? 'bg-rose-600/20 text-rose-400' 
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Star className={`w-5 h-5 ${videoActual.estado === 'favorito' ? 'fill-rose-400' : ''}`} />
          </button>
          <button
            onClick={() => onEditar?.(videoActual)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition backdrop-blur-sm"
          >
            <StickyNote className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="h-full flex flex-col lg:flex-row">
        {/* Reproductor */}
        <div className="flex-1 flex flex-col justify-center bg-black">
          <div className="relative w-full aspect-video max-h-[70vh] mx-auto">
            <iframe
              src={`https://www.youtube.com/embed/${videoActual.video_id}?autoplay=0&rel=0`}
              title={videoActual.titulo}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {/* Info del video debajo del reproductor */}
          <div className="p-4 lg:p-6 max-w-4xl mx-auto w-full">
            <h1 className="text-lg lg:text-xl font-bold text-white mb-2">
              {videoActual.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span>{videoActual.canal}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                videoActual.estado === 'favorito' ? 'bg-rose-950/50 text-rose-300' :
                videoActual.estado === 'visto' ? 'bg-emerald-950/50 text-emerald-300' :
                'bg-amber-950/50 text-amber-300'
              }`}>
                {estadoConfig.label}
              </span>
              <span>•</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-400">
                {categoriaConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="lg:w-96 xl:w-[420px] h-[40vh] lg:h-full overflow-y-auto bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800/50 backdrop-blur-xl">
          <div className="p-4 lg:p-6 space-y-5">
            {/* Timestamps */}
            {videoActual.timestamps_clave && videoActual.timestamps_clave.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Timestamps
                </h3>
                <div className="space-y-1.5">
                  {videoActual.timestamps_clave.map((ts, i) => (
                    <a
                      key={i}
                      href={`https://youtube.com/watch?v=${videoActual.video_id}&t=${tiempoASegundos(ts.tiempo)}s`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition group"
                    >
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/30">
                        {ts.tiempo}
                      </span>
                      <span className="text-sm text-slate-400 group-hover:text-slate-200 transition">
                        {ts.descripcion}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <StickyNote className="w-4 h-4 text-cyan-400" />
                  Notas
                </h3>
                {!editandoNotas && (
                  <button
                    onClick={() => setEditandoNotas(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Editar
                  </button>
                )}
              </div>
              
              {editandoNotas ? (
                <div className="space-y-2">
                  <textarea
                    value={notasEdit}
                    onChange={(e) => setNotasEdit(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                    placeholder="Tus notas..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={guardarNotas}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => { setEditandoNotas(false); setNotasEdit(videoActual.notas_personales || ''); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {videoActual.notas_personales || 'Sin notas aún. Haz click en "Editar" para añadir.'}
                </p>
              )}
            </div>

            {/* Resumen IA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Resumen IA
                </h3>
                <button
                  onClick={handleResumirIA}
                  disabled={generandoResumen}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-800/30 transition disabled:opacity-50"
                >
                  {generandoResumen ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {generandoResumen ? 'Generando...' : 'Generar'}
                </button>
              </div>
              
              {resumenIA && (
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/20">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {resumenIA}
                  </p>
                </div>
              )}
              
              {!resumenIA && !generandoResumen && (
                <p className="text-xs text-slate-500">
                  Genera un resumen automático del contenido del video.
                </p>
              )}
            </div>

            {/* Enlace externo */}
            <a
              href={`https://youtube.com/watch?v=${videoActual.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-800/30 text-sm font-medium transition"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
