// ============================================
// VideoForm.jsx - Formulario CRUD de video
// Permite crear y editar videos
// ============================================

import { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, Star, Link, Tag, Clock, StickyNote
} from 'lucide-react';
import { 
  extraerVideoId, generarThumbnail, CATEGORIAS, ESTADOS 
} from '../../utils/youtube-utils';

export default function VideoForm({ video, onSave, onClose }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    video_id: '',
    titulo: '',
    canal: '',
    url: '',
    thumbnail: '',
    duracion: '',
    categoria: 'tutorial_basico',
    tags: [],
    notas_personales: '',
    timestamps_clave: [],
    fecha_guardado: new Date().toISOString().split('T')[0],
    estado: 'pendiente_ver',
    valoracion: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [timestampForm, setTimestampForm] = useState({ tiempo: '', descripcion: '' });
  const [imgError, setImgError] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Si estamos editando o importando, precargar datos
  useEffect(() => {
    if (video) {
      setFormData({
        video_id: video.video_id || '',
        titulo: video.titulo || '',
        canal: video.canal || '',
        url: video.url || '',
        thumbnail: video.thumbnail || '',
        duracion: video.duracion || '',
        categoria: video.categoria || 'tutorial_basico',
        tags: video.tags || [],
        notas_personales: video.notas_personales || '',
        timestamps_clave: video.timestamps_clave || [],
        fecha_guardado: video.fecha_guardado || new Date().toISOString().split('T')[0],
        estado: video.estado || 'pendiente_ver',
        valoracion: video.valoracion || 0
      });
      // Si hay tags sugeridos, mostrarlos
      if (video.tags && video.tags.length > 0) {
        setTagInput('');
      }
    }
  }, [video]);

  // Detectar si es un video importado (tiene video_id pero no id de BD)
  const esImportado = video && !video.id && video.video_id;

  // Auto-extraer video_id al cambiar la URL
  const handleUrlChange = (url) => {
    const videoId = extraerVideoId(url);
    setFormData(prev => ({
      ...prev,
      url,
      video_id: videoId || prev.video_id,
      thumbnail: videoId ? generarThumbnail(videoId) : prev.thumbnail
    }));
    setImgError(false);
  };

  // Manejar cambio de video_id manual
  const handleVideoIdChange = (videoId) => {
    setFormData(prev => ({
      ...prev,
      video_id,
      thumbnail: videoId ? generarThumbnail(videoId) : prev.thumbnail,
      url: videoId ? `https://youtube.com/watch?v=${videoId}` : prev.url
    }));
    setImgError(false);
  };

  // Agregar tag
  const agregarTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // Eliminar tag
  const eliminarTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Agregar timestamp
  const agregarTimestamp = () => {
    if (timestampForm.tiempo && timestampForm.descripcion) {
      setFormData(prev => ({
        ...prev,
        timestamps_clave: [...prev.timestamps_clave, { ...timestampForm }]
      }));
      setTimestampForm({ tiempo: '', descripcion: '' });
    }
  };

  // Eliminar timestamp
  const eliminarTimestamp = (index) => {
    setFormData(prev => ({
      ...prev,
      timestamps_clave: prev.timestamps_clave.filter((_, i) => i !== index)
    }));
  };

  // Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  };

  const thumbnailUrl = formData.thumbnail || (formData.video_id ? generarThumbnail(formData.video_id) : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {video ? 'Editar Video' : 'Nuevo Video'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* URL y Video ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                <Link className="w-4 h-4 text-cyan-400" />
                URL de YouTube
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                Video ID
              </label>
              <input
                type="text"
                value={formData.video_id}
                onChange={(e) => handleVideoIdChange(e.target.value)}
                placeholder="ID de 11 caracteres"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>
          </div>

          {/* Preview thumbnail */}
          {thumbnailUrl && (
            <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-700/30">
              <img
                src={thumbnailUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              {imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500 text-sm">
                  Thumbnail no disponible
                </div>
              )}
            </div>
          )}

          {/* Título y Canal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                Título *
                {esImportado && formData.titulo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/30">
                    Auto-detectado
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título del video"
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
                Canal *
                {esImportado && formData.canal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/30">
                    Auto-detectado
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.canal}
                onChange={(e) => setFormData(prev => ({ ...prev, canal: e.target.value }))}
                placeholder="Nombre del canal"
                required
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>
          </div>

          {/* Categoría, Duración, Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              >
                {Object.entries(CATEGORIAS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Duración
              </label>
              <input
                type="text"
                value={formData.duracion}
                onChange={(e) => setFormData(prev => ({ ...prev, duracion: e.target.value }))}
                placeholder="Ej: 15:30"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              >
                {Object.entries(ESTADOS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Valoración */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">
              Valoración
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <button
                  key={estrella}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, valoracion: estrella === formData.valoracion ? 0 : estrella }))}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      estrella <= formData.valoracion
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-slate-500 ml-2">
                {formData.valoracion > 0 ? `${formData.valoracion}/5` : 'Sin valorar'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
              <Tag className="w-4 h-4 text-green-400" />
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTag())}
                placeholder="Añadir tag y presionar Enter"
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
              <button
                type="button"
                onClick={agregarTag}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800/70 text-slate-300 border border-slate-700/30">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => eliminarTag(tag)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notas personales */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
              <StickyNote className="w-4 h-4 text-cyan-400" />
              Notas Personales
            </label>
            <textarea
              value={formData.notas_personales}
              onChange={(e) => setFormData(prev => ({ ...prev, notas_personales: e.target.value }))}
              placeholder="Tus notas sobre este video..."
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm resize-none"
            />
          </div>

          {/* Timestamps clave */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Timestamps Clave
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={timestampForm.tiempo}
                onChange={(e) => setTimestampForm(prev => ({ ...prev, tiempo: e.target.value }))}
                placeholder="0:00"
                className="w-20 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
              <input
                type="text"
                value={timestampForm.descripcion}
                onChange={(e) => setTimestampForm(prev => ({ ...prev, descripcion: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarTimestamp())}
                placeholder="Descripción del momento"
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
              <button
                type="button"
                onClick={agregarTimestamp}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.timestamps_clave.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {formData.timestamps_clave.map((ts, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/20">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-800/30">
                      {ts.tiempo}
                    </span>
                    <span className="text-sm text-slate-400 flex-1">{ts.descripcion}</span>
                    <button
                      type="button"
                      onClick={() => eliminarTimestamp(i)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : (video ? 'Actualizar' : 'Guardar')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
