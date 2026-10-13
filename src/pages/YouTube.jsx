// ============================================
// YouTube.jsx - Página principal del módulo
// Contiene el header y la biblioteca
// ============================================

import { Youtube, BookOpen, Sparkles } from 'lucide-react';
import YouTubeLibrary from '../components/youtube/YouTubeLibrary';

export default function YouTube() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header flotante */}
      <header className="border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20">
                <Youtube className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Biblioteca de YouTube
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Gestiona tus videos de IA generativa
                </p>
              </div>
            </div>

            {/* Info badges */}
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/30 hidden sm:flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Módulo 6
              </span>
              <span className="text-xs px-2 py-1 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/30 hidden md:flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                AI Learning
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <YouTubeLibrary />
      </main>
    </div>
  );
}
