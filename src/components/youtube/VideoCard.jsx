// ============================================
// VideoCard.jsx - Tarjeta de video (MEJORADA)
// + Toggle favorito + Notas inline + Animaciones + Tema color
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Edit3, Trash2, Star, GraduationCap, 
  Clock, ExternalLink, Play, Heart, StickyNote,
  Film, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { 
  generarThumbnail, truncarTexto, CATEGORIAS, ESTADOS 
} from '../../utils/youtube-utils';

export default function VideoCard({ video, index = 0, onVerDetalle, onEditar, onEliminar, onToggleFavorito, onActualizarNotas, onAbrirCine, temaColor = false }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [notasExpandidas, setNotasExpandidas] = useState(false);
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [notasTemp, setNotasTemp] = useState(video.notas_personales || '');

  const thumbnailUrl = imgError 
    ? generarThumbnail(video.video_id, 'hq')
    : generarThumbnail(video.video_id, 'max');

  const categoriaConfig = CATEGORIAS[video.categoria] || CATEGORIAS.otro;
  const estadoConfig = ESTADOS[video.estado] || ESTADOS.pendiente_ver;
  const esFavorito = video.estado === 'favorito';

  // Colores de badges por categoría
  const badgeColores = {
    blue: 'bg-blue-950/50 text-blue-300 border-blue-800/30',
    indigo: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/30',
    green: 'bg-green-950/50 text-green-300 border-green-800/30',
    orange: 'bg-orange-950/50 text-orange-300 border-orange-800/30',
    yellow: 'bg-yellow-950/50 text-yellow-300 border-yellow-800/30',
    pink: 'bg-pink-950/50 text-pink-300 border-pink-800/30',
    red: 'bg-red-950/50 text-red-300 border-red-800/30',
    purple: 'bg-purple-950/50 text-purple-300 border-purple-800/30',
    slate: 'bg-slate-800/50 text-slate-300 border-slate-700/30'
  };

  // Borde de tema por categoría
  const bordeTema = temaColor ? categoriaConfig.accentBorder : 'border-slate-800/50';
  const glowTema = temaColor ? `hover:shadow-${categoriaConfig.color}-500/10` : '';

  // Guardar notas inline
  const guardarNotasInline = () => {
    if (onActualizarNotas) {
      onActualizarNotas(video.id, notasTemp);
    }
    setEditandoNotas(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`bg-slate-900/50 border ${bordeTema} rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-slate-700/50 hover:shadow-2xl group ${glowTema}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Barra de acento superior (si tema color activo) */}
      {temaColor && (
        <div className={`h-0.5 bg-gradient-to-r ${categoriaConfig.accent}`} />
      )}

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.titulo}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        
        {/* Overlay con botón play al hover */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onAbrirCine?.(video)}
            className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center hover:bg-red-500 transition shadow-lg hover:scale-110"
          >
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </button>
        </div>

        {/* Duración */}
        {video.duracion && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duracion}
          </div>
        )}

        {/* Badge de estado */}
        <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-md border ${
          esFavorito ? 'bg-rose-950/50 text-rose-300 border-rose-800/30' :
          video.estado === 'visto' ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/30' :
          'bg-amber-950/50 text-amber-300 border-amber-800/30'
        }`}>
          {estadoConfig.label}
        </div>

        {/* Botón favorito (toggle) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorito?.(video);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
            esFavorito 
              ? 'bg-rose-600/80 text-white scale-100' 
              : 'bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:text-rose-400'
          }`}
          title={esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <Heart className={`w-4 h-4 ${esFavorito ? 'fill-white' : ''}`} />
        </button>

        {/* Botón modo cine */}
        <button
          onClick={() => onAbrirCine?.(video)}
          className="absolute bottom-2 left-2 p-1.5 rounded-full bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 hover:bg-black/60 hover:text-white transition-all"
          title="Modo Cine"
        >
          <Film className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2 leading-tight">
          {truncarTexto(video.titulo, 60)}
        </h3>

        {/* Canal */}
        <p className="text-xs text-slate-400 mb-3">
          {video.canal}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-md border ${badgeColores[categoriaConfig.color]}`}>
            {categoriaConfig.label}
          </span>
        </div>

        {/* Valoración con estrellas */}
        {video.valoracion > 0 && (
          <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <Star
                key={estrella}
                className={`w-3.5 h-3.5 ${
                  estrella <= video.valoracion 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700/30">
                #{tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-500">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Notas inline expandibles */}
        {video.notas_personales && (
          <div className="mb-3">
            <button
              onClick={() => setNotasExpandidas(!notasExpandidas)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <StickyNote className="w-3 h-3" />
              <span>Notas</span>
              {notasExpandidas ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {notasExpandidas && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-1.5"
              >
                {editandoNotas ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={notasTemp}
                      onChange={(e) => setNotasTemp(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition resize-none"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={guardarNotasInline}
                        className="px-2 py-1 rounded bg-cyan-600/20 text-cyan-300 text-[10px] hover:bg-cyan-600/30 transition"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditandoNotas(false); setNotasTemp(video.notas_personales || ''); }}
                        className="px-2 py-1 rounded bg-slate-800/50 text-slate-400 text-[10px] hover:bg-slate-800 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => { setEditandoNotas(true); setNotasTemp(video.notas_personales || ''); }}
                    className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/20 cursor-pointer hover:bg-slate-800/50 transition"
                  >
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {video.notas_personales}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">Click para editar</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/50">
          <button
            onClick={() => onVerDetalle(video)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditar(video)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEliminar(video)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={`https://youtube.com/watch?v=${video.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition ml-auto"
            title="Abrir en YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Placeholder Módulo 8 */}
        <button
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-800/30 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 text-xs font-medium transition"
          title="Próximamente: Incluir en ruta de aprendizaje"
          disabled
        >
          <GraduationCap className="w-4 h-4" />
          <span>🎓 Ruta de Aprendizaje</span>
        </button>
      </div>
    </motion.div>
  );
}
