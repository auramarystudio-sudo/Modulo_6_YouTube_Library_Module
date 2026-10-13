// ============================================
// VideoDetail.jsx - Modal de detalle del video
// Muestra toda la info, timestamps y notas
// ============================================

import { useState } from 'react';
import { 
  X, Star, Clock, ExternalLink, Calendar, 
  Tag, StickyNote, PlayCircle, Bookmark
} from 'lucide-react';
import { 
  generarThumbnail, generarURLconTimestamp, 
  formatearTimestamp, tiempoASegundos, CATEGORIAS, ESTADOS 
} from '../../utils/youtube-utils';

export default function VideoDetail({ video, onClose, onEditar }) {
  const [imgError, setImgError] = useState(false);
  const [valoracionEdit, setValoracionEdit] = useState(video.valoracion || 0);

  if (!video) return null;

  const thumbnailUrl = imgError 
    ? generarThumbnail(video.video_id, 'hq')
    : generarThumbnail(video.video_id, 'max');

  const categoriaConfig = CATEGORIAS[video.categoria] || CATEGORIAS.otro;
  const estadoConfig = ESTADOS[video.estado] || ESTADOS.pendiente_ver;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header del modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Detalle del Video
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Thumbnail grande */}
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={video.titulo}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <a
              href={`https://youtube.com/watch?v=${video.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
            >
              <PlayCircle className="w-16 h-16 text-white/90 hover:text-white transition" />
            </a>
          </div>

          {/* Info principal */}
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {video.titulo}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                {video.canal}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {video.fecha_guardado}
              </span>
              {video.duracion && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {video.duracion}
                </span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1.5 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/30">
              {categoriaConfig.label}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-md border ${
              video.estado === 'favorito' ? 'bg-rose-950/50 text-rose-300 border-rose-800/30' :
              video.estado === 'visto' ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/30' :
              'bg-amber-950/50 text-amber-300 border-amber-800/30'
            }`}>
              {estadoConfig.label}
            </span>
          </div>

          {/* Valoración */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Valoración:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <button
                  key={estrella}
                  onClick={() => setValoracionEdit(estrella)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      estrella <= valoracionEdit
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-500">({valoracionEdit}/5)</span>
          </div>

          {/* Notas personales */}
          {video.notas_personales && (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <StickyNote className="w-4 h-4 text-cyan-400" />
                Notas Personales
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {video.notas_personales}
              </p>
            </div>
          )}

          {/* Timestamps clave */}
          {video.timestamps_clave && video.timestamps_clave.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                Timestamps Clave
              </h4>
              <div className="space-y-2">
                {video.timestamps_clave.map((ts, index) => {
                  const segundos = tiempoASegundos(ts.tiempo);
                  return (
                    <a
                      key={index}
                      href={generarURLconTimestamp(video.video_id, segundos)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition group"
                    >
                      <span className="text-xs font-mono px-2 py-1 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/30 group-hover:bg-cyan-900/50 transition">
                        {ts.tiempo}
                      </span>
                      <span className="text-sm text-slate-400 group-hover:text-slate-200 transition">
                        {ts.descripcion}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition ml-auto" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <Tag className="w-4 h-4 text-green-400" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/70 text-slate-300 border border-slate-700/30">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
            <button
              onClick={() => onEditar(video)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg"
            >
              <Star className="w-4 h-4" />
              Editar Video
            </button>
            <a
              href={`https://youtube.com/watch?v=${video.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
