// ============================================
// Transcripción de YouTube - Módulo 6
// Obtiene subtítulos automáticos de videos
// ============================================

/**
 * Obtiene la transcripción de un video de YouTube
 * Usa la API no oficial de YouTube para obtener subtítulos
 */
export async function obtenerTranscripcion(videoId) {
  try {
    // Intentar obtener subtítulos desde el endpoint de YouTube
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=es&fmt=json3`
    );
    
    if (response.ok) {
      const data = await response.json();
      return procesarTranscripcion(data);
    }
    
    // Si falla, intentar con inglés
    const responseEn = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`
    );
    
    if (responseEn.ok) {
      const data = await responseEn.json();
      return procesarTranscripcion(data);
    }
    
    // Si no hay subtítulos disponibles, retornar null
    return null;
  } catch (error) {
    console.warn('No se pudo obtener transcripción:', error);
    return null;
  }
}

/**
 * Procesa la transcripción cruda de YouTube
 */
function procesarTranscripcion(data) {
  if (!data || !data.events) return null;
  
  const transcripcion = data.events
    .filter(event => event.segs)
    .map(event => ({
      start: event.tStartMs / 1000, // Convertir a segundos
      duration: (event.dDurationMs || 0) / 1000,
      text: event.segs.map(seg => seg.utf8).join('')
    }))
    .filter(item => item.text.trim().length > 0);
  
  return transcripcion;
}

/**
 * Busca texto en la transcripción y retorna timestamps
 */
export function buscarEnTranscripcion(transcripcion, termino) {
  if (!transcripcion || !termino) return [];
  
  const terminoLower = termino.toLowerCase();
  
  return transcripcion
    .filter(item => item.text.toLowerCase().includes(terminoLower))
    .map(item => ({
      timestamp: item.start,
      texto: item.text,
      contexto: obtenerContexto(transcripcion, item.start, 50)
    }));
}

/**
 * Obtiene texto de contexto alrededor de un timestamp
 */
function obtenerContexto(transcripcion, timestamp, radioSegundos = 30) {
  const inicio = timestamp - radioSegundos;
  const fin = timestamp + radioSegundos;
  
  const contexto = transcripcion
    .filter(item => item.start >= inicio && item.start <= fin)
    .map(item => item.text)
    .join(' ');
  
  return contexto;
}

/**
 * Formatea segundos a timestamp legible (MM:SS o HH:MM:SS)
 */
export function formatearTimestampTranscripcion(segundos) {
  const hours = Math.floor(segundos / 3600);
  const mins = Math.floor((segundos % 3600) / 60);
  const secs = Math.floor(segundos % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
