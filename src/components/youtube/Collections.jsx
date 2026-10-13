// ============================================
// Collections.jsx - Gestión de colecciones
// Crear, editar, eliminar y reordenar videos
// ============================================

import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Edit3, GripVertical, 
  FolderOpen, ChevronRight, Film, Save
} from 'lucide-react';
import { 
  obtenerColecciones, crearColeccion, actualizarColeccion, 
  eliminarColeccion, añadirVideoAColeccion, quitarVideoDeColeccion,
  reordenarColeccion
} from '../../utils/pb-service';

const COLORES_COLECCION = [
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500/20 border-purple-500/30 text-purple-300' },
  { value: 'blue', label: 'Azul', class: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
  { value: 'green', label: 'Verde', class: 'bg-green-500/20 border-green-500/30 text-green-300' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500/20 border-red-500/30 text-red-300' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500/20 border-orange-500/30 text-orange-300' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500/20 border-pink-500/30 text-pink-300' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' },
];

export default function Collections({ videos, coleccionActiva, onSeleccionarColeccion, onCerrar, onRefrescar }) {
  const [colecciones, setColecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', color: 'purple', icono: '📁' });
  const [draggedVideo, setDraggedVideo] = useState(null);

  useEffect(() => {
    cargarColecciones();
  }, []);

  const cargarColecciones = async () => {
    setCargando(true);
    try {
      const data = await obtenerColecciones();
      setColecciones(data);
    } catch (e) {
      console.error('Error cargando colecciones:', e);
    } finally {
      setCargando(false);
    }
  };

  // Crear colección
  const handleCrear = async () => {
    if (!formData.nombre.trim()) return;
    try {
      await crearColeccion(formData);
      await cargarColecciones();
      setModalCrear(false);
      setFormData({ nombre: '', descripcion: '', color: 'purple', icono: '📁' });
      if (onRefrescar) onRefrescar();
    } catch (e) {
      console.error('Error creando colección:', e);
    }
  };

  // Actualizar colección
  const handleActualizar = async () => {
    if (!editando || !formData.nombre.trim()) return;
    try {
      await actualizarColeccion(editando.id, formData);
      await cargarColecciones();
      setEditando(null);
      setFormData({ nombre: '', descripcion: '', color: 'purple', icono: '📁' });
      if (onRefrescar) onRefrescar();
    } catch (e) {
      console.error('Error actualizando colección:', e);
    }
  };

  // Eliminar colección
  const handleEliminar = async (col) => {
    if (!window.confirm(`¿Eliminar la colección "${col.nombre}"? Los videos no se eliminarán.`)) return;
    try {
      await eliminarColeccion(col.id);
      await cargarColecciones();
      if (coleccionActiva === col.id) onSeleccionarColeccion(null);
      if (onRefrescar) onRefrescar();
    } catch (e) {
      console.error('Error eliminando colección:', e);
    }
  };

  // Editar colección
  const iniciarEdicion = (col) => {
    setEditando(col);
    setFormData({
      nombre: col.nombre,
      descripcion: col.descripcion || '',
      color: col.color || 'purple',
      icono: col.icono || '📁'
    });
  };

  // Drag & Drop para reordenar
  const handleDragStart = (videoId) => {
    setDraggedVideo(videoId);
  };

  const handleDragOver = (e, targetVideoId) => {
    e.preventDefault();
    if (!coleccionActiva || !draggedVideo || draggedVideo === targetVideoId) return;
    
    const col = colecciones.find(c => c.id === coleccionActiva);
    if (!col) return;

    const orden = [...col.orden];
    const fromIdx = orden.indexOf(draggedVideo);
    const toIdx = orden.indexOf(targetVideoId);
    
    if (fromIdx === -1 || toIdx === -1) return;
    
    orden.splice(fromIdx, 1);
    orden.splice(toIdx, 0, draggedVideo);
    
    reordenarColeccion(coleccionActiva, orden);
    cargarColecciones();
  };

  const handleDragEnd = () => {
    setDraggedVideo(null);
  };

  // Añadir video a colección desde fuera
  const handleAñadirVideo = async (videoId) => {
    if (!coleccionActiva) return;
    try {
      await añadirVideoAColeccion(coleccionActiva, videoId);
      await cargarColecciones();
      if (onRefrescar) onRefrescar();
    } catch (e) {
      console.error('Error añadiendo video:', e);
    }
  };

  // Quitar video de colección
  const handleQuitarVideo = async (videoId) => {
    if (!coleccionActiva) return;
    try {
      await quitarVideoDeColeccion(coleccionActiva, videoId);
      await cargarColecciones();
      if (onRefrescar) onRefrescar();
    } catch (e) {
      console.error('Error quitando video:', e);
    }
  };

  // Videos en la colección activa
  const videosEnColeccion = coleccionActiva 
    ? (() => {
        const col = colecciones.find(c => c.id === coleccionActiva);
        if (!col) return [];
        return col.orden
          .map(id => videos.find(v => v.id === id))
          .filter(Boolean);
      })()
    : [];

  const ICONOS = ['📁', '🎨', '📊', '🛠️', '🚀', '🎓', '💡', '🔥', '⭐', '🎯', '📝', '🎬'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            Colecciones
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setModalCrear(true); setEditando(null); setFormData({ nombre: '', descripcion: '', color: 'purple', icono: '📁' }); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Nueva
            </button>
            <button
              onClick={onCerrar}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lista de colecciones */}
              <div className="lg:col-span-1 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mis Colecciones ({colecciones.length})
                </h3>
                
                {/* Todas */}
                <button
                  onClick={() => onSeleccionarColeccion(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left ${
                    coleccionActiva === null
                      ? 'bg-slate-800/50 border-cyan-500/30'
                      : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40'
                  }`}
                >
                  <Film className="w-5 h-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">Todos los videos</p>
                    <p className="text-xs text-slate-500">{videos.length} videos</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>

                {/* Colecciones */}
                {colecciones.map(col => {
                  const colorConfig = COLORES_COLECCION.find(c => c.value === col.color) || COLORES_COLECCION[0];
                  const numVideos = col.orden?.length || 0;
                  
                  return (
                    <div
                      key={col.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                        coleccionActiva === col.id
                          ? `${colorConfig.class} border`
                          : 'bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40'
                      }`}
                    >
                      <button
                        onClick={() => onSeleccionarColeccion(col.id)}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <span className="text-lg">{col.icono || '📁'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{col.nombre}</p>
                          <p className="text-xs text-slate-500">{numVideos} videos</p>
                        </div>
                      </button>
                      <button
                        onClick={() => iniciarEdicion(col)}
                        className="p-1 rounded text-slate-500 hover:text-white transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(col)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Videos en la colección */}
              <div className="lg:col-span-2">
                {coleccionActiva ? (
                  <>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Videos en colección ({videosEnColeccion.length})
                      <span className="ml-2 text-[10px] normal-case text-slate-600">
                        Arrastra para reordenar
                      </span>
                    </h3>
                    
                    {videosEnColeccion.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        <p>Colección vacía</p>
                        <p className="text-xs mt-1">Añade videos desde la biblioteca principal</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {videosEnColeccion.map((video, idx) => (
                          <div
                            key={video.id}
                            draggable
                            onDragStart={() => handleDragStart(video.id)}
                            onDragOver={(e) => handleDragOver(e, video.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/20 hover:bg-slate-800/50 transition cursor-move ${
                              draggedVideo === video.id ? 'opacity-50' : ''
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <span className="text-xs font-mono text-slate-500 w-6">{idx + 1}</span>
                            <img
                              src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                              alt=""
                              className="w-16 h-9 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 truncate">{video.titulo}</p>
                              <p className="text-xs text-slate-500">{video.canal}</p>
                            </div>
                            <button
                              onClick={() => handleQuitarVideo(video.id)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 transition flex-shrink-0"
                              title="Quitar de colección"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                    <p className="text-sm font-medium">Selecciona una colección</p>
                    <p className="text-xs mt-1">para ver y organizar sus videos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {(modalCrear || editando) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setModalCrear(false); setEditando(null); }} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editando ? 'Editar Colección' : 'Nueva Colección'}
            </h3>

            {/* Nombre */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Ruta Stable Diffusion"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
                autoFocus
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Descripción</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción breve..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
              />
            </div>

            {/* Icono */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Icono</label>
              <div className="flex flex-wrap gap-1.5">
                {ICONOS.map(icono => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icono }))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                      formData.icono === icono
                        ? 'bg-cyan-600/20 border border-cyan-500/50'
                        : 'bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800'
                    }`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORES_COLECCION.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: c.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      formData.color === c.value ? c.class : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={editando ? handleActualizar : handleCrear}
                disabled={!formData.nombre.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editando ? 'Guardar' : 'Crear'}
              </button>
              <button
                onClick={() => { setModalCrear(false); setEditando(null); }}
                className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
