// ============================================
// Utilidades para YouTube - Módulo 6
// Helpers para extraer info de URLs de YouTube
// ============================================

/**
 * Extrae el video_id de una URL de YouTube
 * Soporta formatos: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
 * También acepta directamente un ID de 11 caracteres
 */
export function extraerVideoId(url) {
  if (!url) return null;
  
  const patrones = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const patron of patrones) {
    const match = url.trim().match(patron);
    if (match) return match[1];
  }
  return null;
}

/**
 * Genera la URL de la thumbnail de YouTube
 * Calidades disponibles: max (1280x720), hq (480x360), mq (320x180)
 */
export function generarThumbnail(videoId, calidad = 'max') {
  const calidades = { max: 'maxresdefault', hq: 'hqdefault', mq: 'mqdefault' };
  return `https://img.youtube.com/vi/${videoId}/${calidades[calidad]}.jpg`;
}

/**
 * Formatea un timestamp en segundos a formato MM:SS
 * Ejemplo: 125 -> "2:05"
 */
export function formatearTimestamp(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera una URL de YouTube con timestamp específico
 * Ejemplo: videoId="abc123", segundos=125 -> "https://youtube.com/watch?v=abc123&t=125s"
 */
export function generarURLconTimestamp(videoId, segundos) {
  return `https://youtube.com/watch?v=${videoId}&t=${segundos}s`;
}

/**
 * Genera la URL completa de un video de YouTube
 */
export function generarURLVideo(videoId) {
  return `https://youtube.com/watch?v=${videoId}`;
}

/**
 * Categorías disponibles con sus colores y etiquetas
 */
export const CATEGORIAS = {
  tutorial_basico: { label: 'Tutorial Básico', color: 'blue' },
  tutorial_avanzado: { label: 'Tutorial Avanzado', color: 'indigo' },
  workflow: { label: 'Workflow', color: 'green' },
  instalacion: { label: 'Instalación', color: 'orange' },
  optimizacion: { label: 'Optimización', color: 'yellow' },
  prompt_engineering: { label: 'Prompt Engineering', color: 'pink' },
  noticias: { label: 'Noticias', color: 'red' },
  review_modelos: { label: 'Review Modelos', color: 'purple' },
  otro: { label: 'Otro', color: 'slate' }
};

/**
 * Estados disponibles con sus colores y etiquetas
 */
export const ESTADOS = {
  pendiente_ver: { label: 'Pendiente', color: 'amber' },
  visto: { label: 'Visto', color: 'emerald' },
  favorito: { label: 'Favorito', color: 'rose' }
};

/**
 * Trunca un texto a la longitud especificada
 */
export function truncarTexto(texto, maxLength = 60) {
  if (!texto) return '';
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength) + '...';
}

/**
 * Convierte un string de tiempo (formato "M:SS" o "MM:SS") a segundos
 */
export function tiempoASegundos(tiempo) {
  if (!tiempo) return 0;
  const partes = tiempo.split(':');
  if (partes.length === 2) {
    return parseInt(partes[0]) * 60 + parseInt(partes[1]);
  }
  return parseInt(tiempo) || 0;
}
