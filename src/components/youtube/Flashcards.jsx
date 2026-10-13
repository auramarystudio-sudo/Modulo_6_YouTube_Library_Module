// ============================================
// Flashcards.jsx - Sistema de tarjetas de estudio
// Convierte timestamps en flashcards con modo repaso
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, RotateCw, 
  Check, XCircle, Brain, Sparkles, ExternalLink
} from 'lucide-react';
import { tiempoASegundos, generarURLconTimestamp } from '../../utils/youtube-utils';

export default function Flashcards({ videos, onClose }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [modoRepaso, setModoRepaso] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ correctas: 0, incorrectas: 0 });

  // Generar flashcards desde los timestamps de los videos
  useEffect(() => {
    const cards = [];
    
    videos.forEach(video => {
      if (video.timestamps_clave && video.timestamps_clave.length > 0) {
        video.timestamps_clave.forEach((ts, idx) => {
          cards.push({
            id: `${video.id}-${idx}`,
            videoId: video.video_id,
            videoTitulo: video.titulo,
            pregunta: ts.descripcion,
            respuesta: `Timestamp: ${ts.tiempo}`,
            timestamp: ts.tiempo,
            segundos: tiempoASegundos(ts.tiempo)
          });
        });
      }
    });
    
    // Mezclar las tarjetas
    setFlashcards(shuffleArray(cards));
  }, [videos]);

  // Mezclar array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Navegar entre tarjetas
  const siguiente = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const anterior = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  // Marcar como correcta/incorrecta
  const marcarCorrecta = () => {
    setEstadisticas(prev => ({ ...prev, correctas: prev.correctas + 1 }));
    siguiente();
  };

  const marcarIncorrecta = () => {
    setEstadisticas(prev => ({ ...prev, incorrectas: prev.incorrectas + 1 }));
    siguiente();
  };

  // Reiniciar repaso
  const reiniciar = () => {
    setFlashcards(shuffleArray(flashcards));
    setCurrentIndex(0);
    setShowAnswer(false);
    setEstadisticas({ correctas: 0, incorrectas: 0 });
  };

  if (flashcards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800/50 rounded-2xl p-6 text-center">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">No hay flashcards disponibles</h3>
          <p className="text-sm text-slate-400 mb-4">
            Añade timestamps clave a tus videos para generar flashcards automáticamente.
          </p>
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

  const card = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Flashcards
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
          {/* Progreso */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Tarjeta {currentIndex + 1} de {flashcards.length}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-4 h-4" />
                {estadisticas.correctas}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <XCircle className="w-4 h-4" />
                {estadisticas.incorrectas}
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>

          {/* Tarjeta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div 
                onClick={() => setShowAnswer(!showAnswer)}
                className={`min-h-[300px] rounded-2xl border-2 p-8 cursor-pointer transition-all ${
                  showAnswer 
                    ? 'bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-500/30'
                    : 'bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border-cyan-500/30'
                }`}
              >
                {/* Video info */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">{card.videoTitulo}</p>
                  <p className="text-xs text-slate-600">Timestamp: {card.timestamp}</p>
                </div>

                {/* Pregunta/Respuesta */}
                {!showAnswer ? (
                  <div className="text-center">
                    <p className="text-xs text-cyan-400 mb-4 font-medium">PREGUNTA</p>
                    <p className="text-xl font-semibold text-slate-100">
                      {card.pregunta}
                    </p>
                    <p className="text-xs text-slate-500 mt-6">Click para ver respuesta</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-purple-400 mb-4 font-medium">RESPUESTA</p>
                    <p className="text-xl font-semibold text-slate-100">
                      {card.respuesta}
                    </p>
                    <a
                      href={generarURLconTimestamp(card.videoId, card.segundos)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver en YouTube
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <button
              onClick={anterior}
              className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              {showAnswer && (
                <>
                  <button
                    onClick={marcarIncorrecta}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm font-medium transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Incorrecta
                  </button>
                  <button
                    onClick={marcarCorrecta}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-sm font-medium transition"
                  >
                    <Check className="w-4 h-4" />
                    Correcta
                  </button>
                </>
              )}
            </div>

            <button
              onClick={siguiente}
              className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Botón reiniciar */}
          <div className="flex justify-center">
            <button
              onClick={reiniciar}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm transition"
            >
              <RotateCw className="w-4 h-4" />
              Reiniciar repaso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
