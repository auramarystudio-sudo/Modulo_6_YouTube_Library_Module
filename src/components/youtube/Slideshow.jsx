// ============================================
// Slideshow.jsx - Modo Presentación
// Convierte colección en presentación con avance automático
// ============================================

import { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Play, Pause, 
  SkipForward, SkipBack, Maximize, Minimize,
  StickyNote, Clock
} from 'lucide-react';
import { tiempoASegundos, generarURLconTimestamp } from '../../utils/youtube-utils';

export default function Slideshow({ videos, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalo, setIntervalo] = useState(30); // segundos por slide
  const [showNotas, setShowNotas] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-avance
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, intervalo * 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, intervalo, videos.length]);

  // Navegación
  const siguiente = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const anterior = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        siguiente();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        anterior();
      } else if (e.key === 'p') {
        setIsPlaying(prev => !prev);
      } else if (e.key === 'n') {
        setShowNotas(prev => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No hay videos para presentar</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const video = videos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header minimalista */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-400">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle notas */}
          <button
            onClick={() => setShowNotas(!showNotas)}
            className={`p-2 rounded-lg backdrop-blur-sm transition ${
              showNotas ? 'bg-cyan-600/20 text-cyan-400' : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
            title="Mostrar/ocultar notas"
          >
            <StickyNote className="w-5 h-5" />
          </button>

          {/* Toggle fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition backdrop-blur-sm"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-center">
          {/* Video */}
          <div className="flex-1 w-full">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
              <img
                src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                alt={video.titulo}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  {video.titulo}
                </h2>
                <p className="text-lg text-slate-300 mb-2">{video.canal}</p>
                {video.duracion && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{video.duracion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          {showNotas && (
            <div className="lg:w-96 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-cyan-400" />
                Notas
              </h3>
              
              {video.notas_personales ? (
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {video.notas_personales}
                </p>
              ) : (
                <p className="text-sm text-slate-600 italic">Sin notas</p>
              )}

              {/* Timestamps */}
              {video.timestamps_clave && video.timestamps_clave.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Timestamps</h4>
                  <div className="space-y-2">
                    {video.timestamps_clave.slice(0, 5).map((ts, i) => (
                      <a
                        key={i}
                        href={generarURLconTimestamp(video.video_id, tiempoASegundos(ts.tiempo))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition"
                      >
                        <span className="font-mono text-cyan-400">{ts.tiempo}</span>
                        <span className="truncate">{ts.descripcion}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={anterior}
              className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={siguiente}
              className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Control de intervalo */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Intervalo:</span>
            <select
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1min</option>
              <option value={120}>2min</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
