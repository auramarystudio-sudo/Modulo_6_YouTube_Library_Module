// ============================================
// YouTubeImporter.jsx - Importador desde URL (MEJORADO)
// + Sugerencia automática de tags
// + Importación masiva
// ============================================

import { useState } from 'react';
import { 
  X, Link, Search, Plus, AlertCircle, Youtube, 
  Loader2, CheckCircle2, Info, Sparkles, List
} from 'lucide-react';
import { 
  extraerVideoId, generarThumbnail, obtenerInfoVideo, sugerirTags
} from '../../utils/youtube-utils';

export default function YouTubeImporter({ onImportar, onClose }) {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [infoVideo, setInfoVideo] = useState(null);
  const [tagsSugeridos, setTagsSugeridos] = useState([]);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');
  const [modoMasivo, setModoMasivo] = useState(false);
  const [urlsMasivas, setUrlsMasivas] = useState('');

  // Analizar la URL y obtener info del video vía oEmbed
  const analizarURL = async () => {
    setError('');
    setInfoVideo(null);
    setTagsSugeridos([]);
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
      const info = await obtenerInfoVideo(id);
      setInfoVideo(info);
      
      // Sugerir tags automáticamente basados en el título
      const sugeridos = sugerirTags(info.titulo, info.canal);
      setTagsSugeridos(sugeridos);
    } catch (err) {
      setInfoVideo({
        titulo: '',
        canal: '',
        thumbnail: generarThumbnail(id)
      });
      console.warn('oEmbed no disponible:', err.message);
    }

    setAnalizando(false);
  };

  // Importación masiva
  const analizarMasivo = async () => {
    setError('');
    setAnalizando(true);
    
    const lineas = urlsMasivas.split('\n').filter(l => l.trim());
    const resultados = [];
    
    for (const linea of lineas) {
      const id = extraerVideoId(linea.trim());
      if (id) {
        try {
          const info = await obtenerInfoVideo(id);
          resultados.push({
            video_id: id,
            url: linea.trim().startsWith('http') ? linea.trim() : `https://youtube.com/watch?v=${id}`,
            thumbnail: info.thumbnail,
            titulo: info.titulo,
            canal: info.canal,
            tags: sugerirTags(info.titulo, info.canal)
          });
        } catch (e) {
          resultados.push({
            video_id: id,
            url: linea.trim().startsWith('http') ? linea.trim() : `https://youtube.com/watch?v=${id}`,
            thumbnail: generarThumbnail(id),
            titulo: '',
            canal: '',
            tags: []
          });
        }
      }
    }
    
    setAnalizando(false);
    
    if (resultados.length > 0) {
      onImportar(resultados, true); // true = es importación masiva
    } else {
      setError('No se encontraron URLs válidas');
    }
  };

  // Importar individual
  const handleImportar = () => {
    if (videoId) {
      onImportar([{
        video_id: videoId,
        url: url.startsWith('http') ? url : `https://youtube.com/watch?v=${videoId}`,
        thumbnail: infoVideo?.thumbnail || generarThumbnail(videoId),
        titulo: infoVideo?.titulo || '',
        canal: infoVideo?.canal || '',
        tags: tagsSugeridos
      }], false);
    }
  };

  const thumbnailUrl = infoVideo?.thumbnail || (videoId ? generarThumbnail(videoId) : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Importar Videos
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle modo */}
        <div className="flex border-b border-slate-800/50">
          <button
            onClick={() => setModoMasivo(false)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
              !modoMasivo ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-4 h-4" />
            Un video
          </button>
          <button
            onClick={() => setModoMasivo(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition ${
              modoMasivo ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            Varios
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {!modoMasivo ? (
            <>
              {/* Input URL individual */}
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
                      setTagsSugeridos([]);
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
                    <p className="text-xs text-slate-500">Obteniendo datos y sugiriendo tags</p>
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

              {/* Preview del video */}
              {videoId && !analizando && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700/30">
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = generarThumbnail(videoId, 'hq'); }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                      ID: {videoId}
                    </div>
                  </div>

                  {/* Info obtenida */}
                  {infoVideo && (
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
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
                    </div>
                  )}

                  {/* Tags sugeridos automáticamente */}
                  {tagsSugeridos.length > 0 && (
                    <div className="bg-purple-950/20 border border-purple-800/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <p className="text-xs font-medium text-purple-300">
                          Tags sugeridos automáticamente
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tagsSugeridos.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-lg bg-purple-900/30 text-purple-300 border border-purple-800/30">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Se añadirán automáticamente al formulario
                      </p>
                    </div>
                  )}

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
                    • VIDEO_ID (11 caracteres)<br /><br />
                    <strong className="text-emerald-400">✨ Detección automática:</strong><br />
                    Título, canal y tags se obtienen automáticamente.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Modo masivo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <List className="w-4 h-4 text-cyan-400" />
                  Pega múltiples URLs (una por línea)
                </label>
                <textarea
                  value={urlsMasivas}
                  onChange={(e) => setUrlsMasivas(e.target.value)}
                  placeholder={`https://youtube.com/watch?v=abc123\nhttps://youtu.be/def456\nhttps://youtube.com/shorts/ghi789`}
                  rows={6}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm resize-none font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {urlsMasivas.split('\n').filter(l => l.trim()).length} URLs detectadas
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-800/30 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={analizarMasivo}
                disabled={!urlsMasivas.trim() || analizando}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg disabled:opacity-50"
              >
                {analizando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {analizando ? 'Analizando...' : 'Importar Todos'}
              </button>

              <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-purple-400">🚀 Importación masiva:</strong><br />
                  Pega todas las URLs que quieras importar. Se detectarán título, canal y tags automáticamente para cada video.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
