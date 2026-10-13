// ============================================
// YouTubeLibrary.jsx - Componente principal (MEJORADO)
// + Ordenamiento + Colecciones + Cine + Export/Import
// + Toggle favorito + Notas inline + Animaciones + Temas color
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, AlertCircle, Loader2, Youtube, 
  LayoutGrid, List, BookOpen, ArrowUpDown, 
  FolderOpen, Download, Sparkles, Palette, Film
} from 'lucide-react';
import VideoCard from './VideoCard';
import VideoDetail from './VideoDetail';
import VideoForm from './VideoForm';
import YouTubeImporter from './YouTubeImporter';
import CategoryFilter from './CategoryFilter';
import CineView from './CineView';
import Collections from './Collections';
import ExportImport from './ExportImport';
import { CATEGORIAS, ORDENAMIENTOS, generarResumenIA } from '../../utils/youtube-utils';
import { 
  obtenerVideos, crearVideo, actualizarVideo, eliminarVideo,
  obtenerColecciones
} from '../../utils/pb-service';

export default function YouTubeLibrary() {
  // Estado principal
  const [videos, setVideos] = useState([]);
  const [colecciones, setColecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState('fecha_desc');
  const [coleccionActiva, setColeccionActiva] = useState(null);
  
  // Modales
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalForm, setModalForm] = useState(null);
  const [modalImporter, setModalImporter] = useState(false);
  const [modalCine, setModalCine] = useState(null);
  const [modalCollections, setModalCollections] = useState(false);
  const [modalExportImport, setModalExportImport] = useState(false);
  
  // Vista
  const [vistaGrid, setVistaGrid] = useState(true);
  const [temaColor, setTemaColor] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const [videosData, coleccionesData] = await Promise.all([
        obtenerVideos(),
        obtenerColecciones()
      ]);
      setVideos(videosData);
      setColecciones(coleccionesData);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar y ordenar videos
  const videosFiltrados = useMemo(() => {
    let resultado = [...videos];

    // Filtro por colección
    if (coleccionActiva) {
      const col = colecciones.find(c => c.id === coleccionActiva);
      if (col) {
        resultado = col.orden
          .map(id => resultado.find(v => v.id === id))
          .filter(Boolean);
      }
    }

    // Filtro por categoría
    if (filtroCategoria) {
      resultado = resultado.filter(v => v.categoria === filtroCategoria);
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(v => 
        v.titulo.toLowerCase().includes(termino) ||
        v.canal.toLowerCase().includes(termino) ||
        (v.tags && v.tags.some(tag => tag.toLowerCase().includes(termino))) ||
        (v.notas_personales && v.notas_personales.toLowerCase().includes(termino))
      );
    }

    // Ordenamiento
    switch (ordenamiento) {
      case 'fecha_desc':
        resultado.sort((a, b) => new Date(b.fecha_guardado) - new Date(a.fecha_guardado));
        break;
      case 'fecha_asc':
        resultado.sort((a, b) => new Date(a.fecha_guardado) - new Date(b.fecha_guardado));
        break;
      case 'titulo_asc':
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'titulo_desc':
        resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
      case 'valoracion_desc':
        resultado.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
        break;
      case 'canal_asc':
        resultado.sort((a, b) => a.canal.localeCompare(b.canal));
        break;
    }

    return resultado;
  }, [videos, colecciones, filtroCategoria, busqueda, ordenamiento, coleccionActiva]);

  // Conteos por categoría
  const conteos = useMemo(() => {
    const counts = {};
    videos.forEach(v => {
      counts[v.categoria] = (counts[v.categoria] || 0) + 1;
    });
    return counts;
  }, [videos]);

  const categoriasConVideos = useMemo(() => {
    return Object.keys(CATEGORIAS).filter(cat => conteos[cat] > 0);
  }, [conteos]);

  // CRUD Videos
  const handleCrearVideo = async (videoData) => {
    try {
      await crearVideo(videoData);
      await cargarDatos();
      setModalForm(null);
    } catch (err) {
      setError('Error al crear: ' + err.message);
    }
  };

  const handleActualizarVideo = async (videoData) => {
    try {
      await actualizarVideo(modalForm.id, videoData);
      await cargarDatos();
      setModalForm(null);
      setModalDetalle(null);
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    }
  };

  const handleEliminarVideo = async (video) => {
    if (window.confirm(`¿Eliminar "${video.titulo}"?`)) {
      try {
        await eliminarVideo(video.id);
        await cargarDatos();
      } catch (err) {
        setError('Error al eliminar: ' + err.message);
      }
    }
  };

  // Toggle favorito
  const handleToggleFavorito = async (video) => {
    const nuevoEstado = video.estado === 'favorito' ? 'pendiente_ver' : 'favorito';
    try {
      await actualizarVideo(video.id, { estado: nuevoEstado });
      await cargarDatos();
    } catch (err) {
      setError('Error al actualizar favorito: ' + err.message);
    }
  };

  // Actualizar notas inline
  const handleActualizarNotas = async (videoId, notas) => {
    try {
      await actualizarVideo(videoId, { notas_personales: notas });
      await cargarDatos();
    } catch (err) {
      setError('Error al actualizar notas: ' + err.message);
    }
  };

  // Resumen IA
  const handleResumirIA = async (videoId, resumen) => {
    try {
      const video = videos.find(v => v.id === videoId);
      const notasActuales = video?.notas_personales || '';
      const nuevasNotas = notasActuales 
        ? `${notasActuales}\n\n---\n🤖 Resumen IA:\n${resumen}`
        : `🤖 Resumen IA:\n${resumen}`;
      await actualizarVideo(videoId, { notas_personales: nuevasNotas });
      await cargarDatos();
    } catch (err) {
      console.error('Error guardando resumen:', err);
    }
  };

  // Importar videos (soporta individual y masivo)
  const handleImportar = (datosArray, esMasivo = false) => {
    setModalImporter(false);
    
    if (esMasivo) {
      // Importación masiva: crear todos directamente
      (async () => {
        for (const datos of datosArray) {
          await crearVideo({
            ...datos,
            categoria: 'otro',
            estado: 'pendiente_ver',
            valoracion: 0,
            duracion: '',
            notas_personales: '',
            timestamps_clave: []
          });
        }
        await cargarDatos();
      })();
    } else {
      // Individual: abrir formulario precargado
      const datos = datosArray[0];
      setModalForm({
        video_id: datos.video_id,
        url: datos.url,
        thumbnail: datos.thumbnail,
        titulo: datos.titulo || '',
        canal: datos.canal || '',
        categoria: 'tutorial_basico',
        tags: datos.tags || [],
        notas_personales: '',
        timestamps_clave: [],
        estado: 'pendiente_ver',
        valoracion: 0,
        duracion: ''
      });
    }
  };

  // Abrir modo cine
  const handleAbrirCine = (video) => {
    setModalCine(video);
  };

  return (
    <div className="space-y-6">
      {/* Barra superior: búsqueda + acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, canal, tags, notas..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
          />
        </div>

        {/* Controles de vista */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Toggle grid/lista */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <button
              onClick={() => setVistaGrid(true)}
              className={`p-2 rounded-md transition ${vistaGrid ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              title="Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVistaGrid(false)}
              className={`p-2 rounded-md transition ${!vistaGrid ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              title="Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle tema color */}
          <button
            onClick={() => setTemaColor(!temaColor)}
            className={`p-2 rounded-lg border transition ${
              temaColor 
                ? 'bg-purple-600/20 border-purple-500/30 text-purple-400' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
            }`}
            title="Temas de color por categoría"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Ordenamiento */}
          <div className="relative">
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="appearance-none bg-slate-800/50 border border-slate-700/50 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition cursor-pointer"
            >
              {ORDENAMIENTOS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalCollections(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white text-xs font-medium transition"
            title="Colecciones"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Colecciones</span>
          </button>
          <button
            onClick={() => setModalExportImport(true)}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white transition"
            title="Exportar/Importar"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalImporter(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
      </div>

      {/* Filtros de categoría */}
      <CategoryFilter
        categorias={categoriasConVideos}
        conteos={conteos}
        categoriaActiva={filtroCategoria}
        onCambiarCategoria={setFiltroCategoria}
      />

      {/* Info colección activa */}
      {coleccionActiva && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-800/20"
        >
          <FolderOpen className="w-5 h-5 text-purple-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-300">
              {colecciones.find(c => c.id === coleccionActiva)?.nombre}
            </p>
            <p className="text-xs text-slate-500">
              {videosFiltrados.length} videos en esta colección
            </p>
          </div>
          <button
            onClick={() => setColeccionActiva(null)}
            className="text-xs text-purple-400 hover:text-purple-300 transition"
          >
            Ver todos
          </button>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/30 border border-red-800/30 text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300 transition text-sm">
            Cerrar
          </button>
        </div>
      )}

      {/* Loading */}
      {cargando && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Cargando biblioteca...</p>
        </div>
      )}

      {/* Grid de videos */}
      {!cargando && videosFiltrados.length > 0 && (
        <div className={
          vistaGrid 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'flex flex-col gap-3'
        }>
          <AnimatePresence>
            {videosFiltrados.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onVerDetalle={setModalDetalle}
                onEditar={(v) => setModalForm(v)}
                onEliminar={handleEliminarVideo}
                onToggleFavorito={handleToggleFavorito}
                onActualizarNotas={handleActualizarNotas}
                onAbrirCine={handleAbrirCine}
                temaColor={temaColor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Estado vacío */}
      {!cargando && videosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
            {videos.length === 0 ? (
              <Youtube className="w-8 h-8 text-slate-600" />
            ) : (
              <Search className="w-8 h-8 text-slate-600" />
            )}
          </div>
          <div className="text-center">
            {videos.length === 0 ? (
              <>
                <p className="text-slate-300 font-medium mb-1">Biblioteca vacía</p>
                <p className="text-slate-500 text-sm">Añade tu primer video de YouTube</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 font-medium mb-1">Sin resultados</p>
                <p className="text-slate-500 text-sm">No se encontraron videos con los filtros actuales</p>
              </>
            )}
          </div>
          {videos.length === 0 && (
            <button
              onClick={() => setModalImporter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg mt-2"
            >
              <Plus className="w-4 h-4" />
              Añadir primer video
            </button>
          )}
        </div>
      )}

      {/* Resumen */}
      {!cargando && videos.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/30">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {videosFiltrados.length} de {videos.length} videos
          </span>
          <div className="flex items-center gap-3">
            {filtroCategoria && <span>Filtro: {CATEGORIAS[filtroCategoria]?.label}</span>}
            {coleccionActiva && <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" />Colección activa</span>}
          </div>
        </div>
      )}

      {/* ===== MODALES ===== */}

      {/* Modal detalle */}
      {modalDetalle && (
        <VideoDetail
          video={modalDetalle}
          onClose={() => setModalDetalle(null)}
          onEditar={(v) => { setModalDetalle(null); setModalForm(v); }}
        />
      )}

      {/* Modal formulario */}
      {modalForm && (
        <VideoForm
          video={modalForm === 'nuevo' ? null : modalForm}
          onSave={modalForm.id ? handleActualizarVideo : handleCrearVideo}
          onClose={() => setModalForm(null)}
        />
      )}

      {/* Modal importador */}
      {modalImporter && (
        <YouTubeImporter
          onImportar={handleImportar}
          onClose={() => setModalImporter(false)}
        />
      )}

      {/* Vista Cine */}
      {modalCine && (
        <CineView
          video={modalCine}
          videosRelacionados={videosFiltrados}
          onClose={() => setModalCine(null)}
          onEditar={(v) => { setModalCine(null); setModalForm(v); }}
          onToggleFavorito={handleToggleFavorito}
          onResumirIA={handleResumirIA}
          onActualizarNotas={handleActualizarNotas}
        />
      )}

      {/* Modal colecciones */}
      {modalCollections && (
        <Collections
          videos={videos}
          coleccionActiva={coleccionActiva}
          onSeleccionarColeccion={(id) => { setColeccionActiva(id); setModalCollections(false); }}
          onCerrar={() => setModalCollections(false)}
          onRefrescar={cargarDatos}
        />
      )}

      {/* Modal exportar/importar */}
      {modalExportImport && (
        <ExportImport
          videos={videos}
          onImportar={cargarDatos}
          onClose={() => setModalExportImport(false)}
        />
      )}
    </div>
  );
}
