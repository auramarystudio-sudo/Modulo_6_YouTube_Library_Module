// ============================================
// CategoryFilter.jsx - Filtros por categoría
// Muestra chips con contadores dinámicos
// ============================================

import { Filter } from 'lucide-react';
import { CATEGORIAS } from '../../utils/youtube-utils';

export default function CategoryFilter({ categorias, conteos, categoriaActiva, onCambiarCategoria }) {
  // Contar todos los videos
  const totalVideos = Object.values(conteos).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Icono de filtro */}
      <div className="flex items-center gap-1 text-slate-400 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">Filtrar:</span>
      </div>

      {/* Chip "Todos" */}
      <button
        onClick={() => onCambiarCategoria(null)}
        className={`
          text-xs px-3 py-1.5 rounded-lg border transition font-medium
          ${categoriaActiva === null
            ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800'
          }
        `}
      >
        Todos ({totalVideos})
      </button>

      {/* Chips de categorías */}
      {categorias.map((cat) => {
        const config = CATEGORIAS[cat];
        const count = conteos[cat] || 0;
        const isActive = categoriaActiva === cat;

        // Colores según categoría
        const colores = {
          blue: 'bg-blue-600/20 border-blue-500/50 text-blue-300',
          indigo: 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300',
          green: 'bg-green-600/20 border-green-500/50 text-green-300',
          orange: 'bg-orange-600/20 border-orange-500/50 text-orange-300',
          yellow: 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300',
          pink: 'bg-pink-600/20 border-pink-500/50 text-pink-300',
          red: 'bg-red-600/20 border-red-500/50 text-red-300',
          purple: 'bg-purple-600/20 border-purple-500/50 text-purple-300',
          slate: 'bg-slate-600/20 border-slate-500/50 text-slate-300'
        };

        return (
          <button
            key={cat}
            onClick={() => onCambiarCategoria(cat)}
            className={`
              text-xs px-3 py-1.5 rounded-lg border transition font-medium
              ${isActive
                ? `${colores[config.color]} shadow-lg`
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            {config.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
