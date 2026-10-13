// ============================================
// YouTubeImporter.jsx - Importador desde URL
// Obtiene título y canal automáticamente vía oEmbed
// ============================================

import { useState } from 'react';
import { 
  X, Link, Search, Plus, AlertCircle, Youtube, 
  Loader2, CheckCircle2, Info
} from 'lucide-react';
import { 
  extraerVideoId, generarThumbnail, obtenerInfoVideo 
} from '../../utils/youtube-utils';

export default function YouTubeImporter({ onImportar, onClose }) {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [infoVideo, setInfoVideo] = useState(null); // { titulo, canal, thumbnail }
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');

  // Analizar la URL y obtener info del video vía oEmbed
  const analizarURL = async () => {
    setError('');
    setInfoVideo(null);
    setAnalizando(true);

    const id = extraerVideoId(url);
    
    if (!id) {
      setError('No se pudo extraer un ID de video válido de la URL');
      setVideoId(null);
      setAnalizando(false);
      return;
    }

    setVideoId(id);

    try {
      // Obtener título y canal automáticamente desde oEmbed
      const info = await obtenerInfoVideo(id);
      setInfoVideo(info);
    } catch (err) {
      // Si falla oEmbed, al menos tenemos el ID y thumbnail
      setInfoVideo({
        titulo: '',
        canal: '',
        thumbnail: generarThumbnail(id)
      });
      // No mostramos error si oEmbed falla, el usuario puede completar manualmente
      console.warn('oEmbed no disponible, datos manuales:', err.message);
    }

    setAnalizando(false);
  };

  // Importar a la biblioteca (abre el formulario precargado)
  const handleImportar = () => {
    if (videoId) {
      onImportar({
        video_id: videoId,
        url: url.startsWith('http') ? url : `https://youtube.com/watch?v=${videoId}`,
        thumbnail: infoVideo?.thumbnail || generarThumbnail(videoId),
        titulo: infoVideo?.titulo || '',
        canal: infoVideo?.canal || ''
      });
    }
  };

  const thumbnailUrl = infoVideo?.thumbnail || (videoId ? generarThumbnail(videoId) : '');

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
                  setInfoVideo(null);
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
                {analizando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {analizando ? '...' : 'Analizar'}
              </button>
            </div>
          </div>

          {/* Estado de análisis */}
          {analizando && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <div>
                <p className="text-sm text-slate-300 font-medium">Analizando video...</p>
                <p className="text-xs text-slate-500">Obteniendo título y canal desde YouTube</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-800/30 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Preview del video con datos obtenidos */}
          {videoId && !analizando && (
            <div className="space-y-4">
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

              {/* Info obtenida automáticamente */}
              {infoVideo && (
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
                  {/* Datos obtenidos */}
                  {infoVideo.titulo && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-400 font-medium mb-0.5">Título detectado</p>
                        <p className="text-sm text-slate-200">{infoVideo.titulo}</p>
                      </div>
                    </div>
                  )}
                  
                  {infoVideo.canal && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-400 font-medium mb-0.5">Canal detectado</p>
                        <p className="text-sm text-slate-200">{infoVideo.canal}</p>
                      </div>
                    </div>
                  )}

                  {/* Si no se pudo obtener datos */}
                  {!infoVideo.titulo && !infoVideo.canal && (
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-amber-400 font-medium mb-0.5">Datos no disponibles</p>
                        <p className="text-xs text-slate-500">
                          No se pudo obtener el título y canal automáticamente. 
                          Podrás completarlos manualmente en el formulario.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Nota sobre la categoría */}
                  <div className="flex items-start gap-2 pt-2 border-t border-slate-700/20">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-cyan-400 font-medium mb-0.5">Categoría personalizada</p>
                      <p className="text-xs text-slate-500">
                        La categoría la seleccionarás en el formulario según tu sistema de organización.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón importar */}
              <button
                onClick={handleImportar}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {infoVideo?.titulo ? 'Continuar con datos detectados' : 'Añadir a Biblioteca'}
              </button>
            </div>
          )}

          {/* Instrucciones */}
          {!videoId && !error && !analizando && (
            <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-400">Formatos soportados:</strong><br />
                • https://youtube.com/watch?v=VIDEO_ID<br />
                • https://youtu.be/VIDEO_ID<br />
                • https://youtube.com/shorts/VIDEO_ID<br />
                • VIDEO_ID (11 caracteres directamente)<br /><br />
                <strong className="text-emerald-400">✨ Detección automática:</strong><br />
                El título y canal se obtienen automáticamente del video de YouTube.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
