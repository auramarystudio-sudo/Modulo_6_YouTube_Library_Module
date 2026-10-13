// ============================================
// useKeyboardShortcuts.jsx - Hook de atajos de teclado
// Atajos estilo Vim para navegación rápida
// ============================================

import { useEffect } from 'react';

/**
 * Hook para atajos de teclado globales
 * @param {Object} handlers - Objeto con las funciones a ejecutar
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignorar si estamos en un input/textarea
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignorar si hay modales abiertos (excepto Escape)
      if (e.key !== 'Escape' && handlers.modalAbierto) {
        return;
      }

      switch (e.key) {
        case 'j': // Siguiente video
          e.preventDefault();
          handlers.siguiente?.();
          break;
        
        case 'k': // Video anterior
          e.preventDefault();
          handlers.anterior?.();
          break;
        
        case 'Enter': // Abrir detalle
          if (handlers.abrirDetalle) {
            e.preventDefault();
            handlers.abrirDetalle();
          }
          break;
        
        case 'c': // Abrir modo cine
          if (handlers.abrirCine) {
            e.preventDefault();
            handlers.abrirCine();
          }
          break;
        
        case 'f': // Toggle favorito
          if (handlers.toggleFavorito) {
            e.preventDefault();
            handlers.toggleFavorito();
          }
          break;
        
        case '/': // Buscar
          if (handlers.focusBusqueda) {
            e.preventDefault();
            handlers.focusBusqueda();
          }
          break;
        
        case 'n': // Nuevo video
          if (handlers.nuevoVideo) {
            e.preventDefault();
            handlers.nuevoVideo();
          }
          break;
        
        case 'Escape': // Cerrar modal
          if (handlers.cerrarModal) {
            e.preventDefault();
            handlers.cerrarModal();
          }
          break;
        
        case 'd': // Eliminar
          if (handlers.eliminar) {
            e.preventDefault();
            handlers.eliminar();
          }
          break;
        
        case 'e': // Editar
          if (handlers.editar) {
            e.preventDefault();
            handlers.editar();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

/**
 * Lista de atajos disponibles para mostrar en UI
 */
export const ATAJOS_DISPONIBLES = [
  { tecla: 'j', descripcion: 'Siguiente video', icono: '↓' },
  { tecla: 'k', descripcion: 'Video anterior', icono: '↑' },
  { tecla: 'Enter', descripcion: 'Ver detalle', icono: '👁' },
  { tecla: 'c', descripcion: 'Modo cine', icono: '🎬' },
  { tecla: 'f', descripcion: 'Favorito', icono: '❤️' },
  { tecla: '/', descripcion: 'Buscar', icono: '🔍' },
  { tecla: 'n', descripcion: 'Nuevo video', icono: '➕' },
  { tecla: 'Esc', descripcion: 'Cerrar modal', icono: '✕' },
  { tecla: 'd', descripcion: 'Eliminar', icono: '🗑' },
  { tecla: 'e', descripcion: 'Editar', icono: '✏️' }
];
