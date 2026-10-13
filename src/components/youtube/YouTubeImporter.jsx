// ============================================
// YouTubeImporter.jsx - Importador desde URL
// Permite pegar URL y previsualizar antes de añadir
// ============================================

import { useState } from 'react';
import { 
  X, Link, Search, Plus, AlertCircle, Youtube
} from 'lucide-react';
import { extraerVideoId, generarThumbnail } from '../../utils/youtube-utils';

export default function YouTubeImporter({ onImportar, onClose }) {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');

  // Analizar la URL pegada
  const analizarURL = () => {
    setError('');
    setAnalizando(true);

    setTimeout(() => {
      const id = extraerVideoId(url);
      if (id) {
        setVideoId(id);
      } else {
        setError('No se pudo extraer un ID de video válido de la URL');
        setVideoId(null);
      }
      setAnalizando(false);
    }, 500);
  };

  // Importar a la biblioteca (abre el formulario precargado)
  const handleImportar = () => {
    if (videoId) {
      onImportar({
        video_id: videoId,
        url: url.startsWith('http') ? url : `https://youtube.com/watch?v=${videoId}`,
        thumbnail: generarThumbnail(videoId)
      });
    }
  };

  const thumbnailUrl = videoId ? generarThumbnail(videoId) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Importar Video
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {/* Input URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Link className="w-4 h-4 text-cyan-400" />
              Pega la URL de YouTube
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setVideoId(null);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && analizarURL()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                autoFocus
              />
              <button
                onClick={analizarURL}
                disabled={!url || analizando}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                {analizando ? '...' : 'Analizar'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-800/30 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Preview del video */}
          {videoId && (
            <div className="space-y-4 animate-in fade-in">
              {/* Thumbnail preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700/30">
                <img
                  src={thumbnailUrl}
                  alt="Preview del video"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = generarThumbnail(videoId, 'hq');
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                  ID: {videoId}
                </div>
              </div>

              {/* Info */}
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">
                  ✅ Video detectado correctamente
                </p>
                <p className="text-xs text-slate-500">
                  Se abrirá el formulario para completar los detalles del video.
                </p>
              </div>

              {/* Botón importar */}
              <button
                onClick={handleImportar}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir a Biblioteca
              </button>
            </div>
          )}

          {/* Instrucciones */}
          {!videoId && !error && (
            <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-400">Formatos soportados:</strong><br />
                • https://youtube.com/watch?v=VIDEO_ID<br />
                • https://youtu.be/VIDEO_ID<br />
                • https://youtube.com/shorts/VIDEO_ID<br />
                • VIDEO_ID (11 caracteres directamente)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
