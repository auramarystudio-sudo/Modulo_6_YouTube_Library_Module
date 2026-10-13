// ============================================
// YouTubeLibrary.jsx - Componente principal
// Gestiona la biblioteca completa de videos
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, AlertCircle, Loader2, Youtube, 
  LayoutGrid, List, BookOpen
} from 'lucide-react';
import VideoCard from './VideoCard';
import VideoDetail from './VideoDetail';
import VideoForm from './VideoForm';
import YouTubeImporter from './YouTubeImporter';
import CategoryFilter from './CategoryFilter';
import { CATEGORIAS } from '../../utils/youtube-utils';
import { 
  obtenerVideos, crearVideo, actualizarVideo, eliminarVideo 
} from '../../utils/pb-service';

export default function YouTubeLibrary() {
  // Estado principal
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  
  // Modales
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalForm, setModalForm] = useState(null); // null | 'nuevo' | video
  const [modalImporter, setModalImporter] = useState(false);
  
  // Vista
  const [vistaGrid, setVistaGrid] = useState(true);

  // Cargar videos al montar
  useEffect(() => {
    cargarVideos();
  }, []);

  // Cargar videos desde el servicio
  const cargarVideos = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerVideos();
      setVideos(data);
    } catch (err) {
      setError('Error al cargar los videos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar videos en tiempo real
  const videosFiltrados = useMemo(() => {
    let resultado = [...videos];

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

    return resultado;
  }, [videos, filtroCategoria, busqueda]);

  // Conteos por categoría
  const conteos = useMemo(() => {
    const counts = {};
    videos.forEach(v => {
      counts[v.categoria] = (counts[v.categoria] || 0) + 1;
    });
    return counts;
  }, [videos]);

  // Categorías que tienen videos
  const categoriasConVideos = useMemo(() => {
    return Object.keys(CATEGORIAS).filter(cat => conteos[cat] > 0);
  }, [conteos]);

  // Crear video
  const handleCrearVideo = async (videoData) => {
    try {
      await crearVideo(videoData);
      await cargarVideos();
      setModalForm(null);
    } catch (err) {
      setError('Error al crear el video: ' + err.message);
    }
  };

  // Actualizar video
  const handleActualizarVideo = async (videoData) => {
    try {
      await actualizarVideo(modalForm.id, videoData);
      await cargarVideos();
      setModalForm(null);
      setModalDetalle(null);
    } catch (err) {
      setError('Error al actualizar el video: ' + err.message);
    }
  };

  // Eliminar video
  const handleEliminarVideo = async (video) => {
    if (window.confirm(`¿Eliminar "${video.titulo}" de la biblioteca?`)) {
      try {
        await eliminarVideo(video.id);
        await cargarVideos();
      } catch (err) {
        setError('Error al eliminar el video: ' + err.message);
      }
    }
  };

  // Importar desde URL (con datos precargados de oEmbed)
  const handleImportar = (datos) => {
    setModalImporter(false);
    setModalForm({
      video_id: datos.video_id,
      url: datos.url,
      thumbnail: datos.thumbnail,
      titulo: datos.titulo || '',
      canal: datos.canal || '',
      categoria: 'tutorial_basico',
      tags: [],
      notas_personales: '',
      timestamps_clave: [],
      estado: 'pendiente_ver',
      valoracion: 0,
      duracion: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, canal, tags..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition text-sm"
          />
        </div>

        {/* Toggle vista */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <button
            onClick={() => setVistaGrid(true)}
            className={`p-2 rounded-md transition ${vistaGrid ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title="Vista cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVistaGrid(false)}
            className={`p-2 rounded-md transition ${!vistaGrid ? 'bg-cyan-600/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            title="Vista lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Botón añadir */}
        <button
          onClick={() => setModalImporter(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Añadir Video</span>
        </button>
      </div>

      {/* Filtros de categoría */}
      <CategoryFilter
        categorias={categoriasConVideos}
        conteos={conteos}
        categoriaActiva={filtroCategoria}
        onCambiarCategoria={setFiltroCategoria}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/30 border border-red-800/30 text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300 transition text-sm"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Estado de carga */}
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
          {videosFiltrados.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onVerDetalle={setModalDetalle}
              onEditar={(v) => setModalForm(v)}
              onEliminar={handleEliminarVideo}
            />
          ))}
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
                <p className="text-slate-500 text-sm">
                  Añade tu primer video de YouTube para comenzar
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-300 font-medium mb-1">Sin resultados</p>
                <p className="text-slate-500 text-sm">
                  No se encontraron videos con los filtros actuales
                </p>
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
          <span>
            {filtroCategoria && `Filtrado por: ${CATEGORIAS[filtroCategoria]?.label}`}
          </span>
        </div>
      )}

      {/* Modal de detalle */}
      {modalDetalle && (
        <VideoDetail
          video={modalDetalle}
          onClose={() => setModalDetalle(null)}
          onEditar={(v) => {
            setModalDetalle(null);
            setModalForm(v);
          }}
        />
      )}

      {/* Modal de formulario */}
      {modalForm && (
        <VideoForm
          video={modalForm === 'nuevo' ? null : modalForm}
          onSave={modalForm.id ? handleActualizarVideo : handleCrearVideo}
          onClose={() => setModalForm(null)}
        />
      )}

      {/* Modal de importador */}
      {modalImporter && (
        <YouTubeImporter
          onImportar={handleImportar}
          onClose={() => setModalImporter(false)}
        />
      )}
    </div>
  );
}
