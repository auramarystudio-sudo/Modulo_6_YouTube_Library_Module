// ============================================
// Utilidades para YouTube - Módulo 6 (MEJORADO)
// Helpers para extraer info de URLs de YouTube
// + Sugerencia automática de tags
// ============================================

/**
 * Extrae el video_id de una URL de YouTube
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
 */
export function generarThumbnail(videoId, calidad = 'max') {
  const calidades = { max: 'maxresdefault', hq: 'hqdefault', mq: 'mqdefault' };
  return `https://img.youtube.com/vi/${videoId}/${calidades[calidad]}.jpg`;
}

/**
 * Formatea un timestamp en segundos a formato MM:SS
 */
export function formatearTimestamp(segundos) {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera una URL de YouTube con timestamp específico
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
 * Categorías disponibles con sus colores, etiquetas y temas de acento
 */
export const CATEGORIAS = {
  tutorial_basico: { 
    label: 'Tutorial Básico', 
    color: 'blue',
    accent: 'from-blue-500 to-cyan-500',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10'
  },
  tutorial_avanzado: { 
    label: 'Tutorial Avanzado', 
    color: 'indigo',
    accent: 'from-indigo-500 to-purple-500',
    accentBorder: 'border-indigo-500/30',
    accentBg: 'bg-indigo-500/10'
  },
  workflow: { 
    label: 'Workflow', 
    color: 'green',
    accent: 'from-green-500 to-emerald-500',
    accentBorder: 'border-green-500/30',
    accentBg: 'bg-green-500/10'
  },
  instalacion: { 
    label: 'Instalación', 
    color: 'orange',
    accent: 'from-orange-500 to-amber-500',
    accentBorder: 'border-orange-500/30',
    accentBg: 'bg-orange-500/10'
  },
  optimizacion: { 
    label: 'Optimización', 
    color: 'yellow',
    accent: 'from-yellow-500 to-orange-500',
    accentBorder: 'border-yellow-500/30',
    accentBg: 'bg-yellow-500/10'
  },
  prompt_engineering: { 
    label: 'Prompt Engineering', 
    color: 'pink',
    accent: 'from-pink-500 to-rose-500',
    accentBorder: 'border-pink-500/30',
    accentBg: 'bg-pink-500/10'
  },
  noticias: { 
    label: 'Noticias', 
    color: 'red',
    accent: 'from-red-500 to-orange-500',
    accentBorder: 'border-red-500/30',
    accentBg: 'bg-red-500/10'
  },
  review_modelos: { 
    label: 'Review Modelos', 
    color: 'purple',
    accent: 'from-purple-500 to-fuchsia-500',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10'
  },
  otro: { 
    label: 'Otro', 
    color: 'slate',
    accent: 'from-slate-500 to-slate-600',
    accentBorder: 'border-slate-500/30',
    accentBg: 'bg-slate-500/10'
  }
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
 * Opciones de ordenamiento
 */
export const ORDENAMIENTOS = [
  { value: 'fecha_desc', label: 'Más recientes', icon: 'calendar' },
  { value: 'fecha_asc', label: 'Más antiguos', icon: 'calendar' },
  { value: 'titulo_asc', label: 'Título A-Z', icon: 'text' },
  { value: 'titulo_desc', label: 'Título Z-A', icon: 'text' },
  { value: 'valoracion_desc', label: 'Mejor valorados', icon: 'star' },
  { value: 'canal_asc', label: 'Canal A-Z', icon: 'user' }
];

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

/**
 * Obtiene información del video usando YouTube oEmbed API
 */
export async function obtenerInfoVideo(videoId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!response.ok) throw new Error('Video no encontrado o privado');
    const data = await response.json();
    return {
      titulo: data.title || '',
      canal: data.author_name || '',
      thumbnail: data.thumbnail_url || generarThumbnail(videoId)
    };
  } catch (error) {
    console.error('Error al obtener info del video:', error);
    throw new Error('No se pudo obtener la información del video.');
  }
}

/**
 * 🧠 Sugerencia automática de tags basada en el título
 * Analiza palabras clave comunes en contenido de IA generativa
 */
export function sugerirTags(titulo, canal = '') {
  if (!titulo) return [];
  
  const texto = `${titulo} ${canal}`.toLowerCase();
  const sugerencias = [];
  
  // Diccionario de palabras clave → tags
  const diccionario = {
    // Modelos específicos
    'stable diffusion': ['stable-diffusion', 'generacion-imagen'],
    'sdxl': ['sdxl', 'stable-diffusion'],
    'midjourney': ['midjourney', 'generacion-imagen'],
    'dall-e': ['dall-e', 'openai', 'generacion-imagen'],
    'dalle': ['dall-e', 'openai', 'generacion-imagen'],
    'flux': ['flux', 'generacion-imagen'],
    'comfyui': ['comfyui', 'workflow'],
    'automatic1111': ['automatic1111', 'ui'],
    'fooocus': ['fooocus', 'ui'],
    'invokeai': ['invokeai', 'ui'],
    
    // Modelos de lenguaje
    'gpt': ['gpt', 'llm', 'openai'],
    'gpt-4': ['gpt-4', 'llm', 'openai'],
    'chatgpt': ['chatgpt', 'llm', 'openai'],
    'claude': ['claude', 'llm', 'anthropic'],
    'gemini': ['gemini', 'llm', 'google'],
    'llama': ['llama', 'llm', 'meta'],
    'mistral': ['mistral', 'llm'],
    'copilot': ['copilot', 'codigo'],
    'cursor': ['cursor', 'codigo', 'ide'],
    
    // Video
    'sora': ['sora', 'generacion-video', 'openai'],
    'runway': ['runway', 'generacion-video'],
    'pika': ['pika', 'generacion-video'],
    'kling': ['kling', 'generacion-video'],
    'luma': ['luma', 'generacion-video', '3d'],
    
    // Audio / Voz
    'elevenlabs': ['elevenlabs', 'voz', 'tts'],
    'tts': ['tts', 'voz'],
    'whisper': ['whisper', 'transcripcion', 'openai'],
    'udio': ['udio', 'generacion-musica'],
    'suno': ['suno', 'generacion-musica'],
    
    // Técnicas
    'prompt': ['prompt', 'prompting'],
    'prompting': ['prompting', 'prompt'],
    'lora': ['lora', 'entrenamiento'],
    'controlnet': ['controlnet', 'control'],
    'ipadapter': ['ipadapter', 'control'],
    'upscal': ['upscaling', 'mejora-imagen'],
    'inpaint': ['inpainting', 'edicion'],
    'outpaint': ['outpainting', 'edicion'],
    'fine-tun': ['fine-tuning', 'entrenamiento'],
    'finetun': ['fine-tuning', 'entrenamiento'],
    'entrenamiento': ['entrenamiento'],
    'training': ['entrenamiento'],
    
    // Conceptos generales
    'tutorial': ['tutorial'],
    'workflow': ['workflow'],
    'instalacion': ['instalacion', 'setup'],
    'install': ['instalacion', 'setup'],
    'setup': ['setup', 'instalacion'],
    'review': ['review', 'analisis'],
    'comparativa': ['comparativa', 'analisis'],
    'benchmark': ['benchmark', 'analisis'],
    'noticia': ['noticias'],
    'news': ['noticias'],
    'avanzado': ['avanzado'],
    'basico': ['basico', 'principiante'],
    'principiante': ['principiante', 'basico'],
    'beginner': ['principiante', 'basico'],
    
    // Herramientas / Plataformas
    'hugging face': ['huggingface', 'modelos'],
    'huggingface': ['huggingface', 'modelos'],
    'civitai': ['civitai', 'modelos', 'comunidad'],
    'replicate': ['replicate', 'api'],
    'api': ['api', 'desarrollo'],
    'python': ['python', 'codigo'],
    'javascript': ['javascript', 'codigo'],
    'langchain': ['langchain', 'framework'],
    'llamaindex': ['llamaindex', 'framework'],
    
    // 3D / Espacial
    '3d': ['3d', 'modelado'],
    'nerf': ['nerf', '3d'],
    'gaussian': ['gaussian-splatting', '3d'],
    'tripo': ['tripo', '3d', 'generacion-3d'],
    'meshy': ['meshy', '3d', 'generacion-3d'],
  };
  
  // Buscar coincidencias
  for (const [palabra, tags] of Object.entries(diccionario)) {
    if (texto.includes(palabra)) {
      sugerencias.push(...tags);
    }
  }
  
  // Eliminar duplicados y limitar a 8
  const unicos = [...new Set(sugerencias)];
  return unicos.slice(0, 8);
}

/**
 * 🤖 Genera un resumen simulado con IA (placeholder para Módulo 8)
 * En producción, esto llamaría a una API de IA real
 */
export async function generarResumenIA(video) {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Resumen basado en el título y notas existentes
  const base = video.notas_personales 
    ? `Basándome en tus notas, este video de ${video.canal} trata sobre "${video.titulo}". `
    : `Este video de ${video.canal} titulado "${video.titulo}" `;
  
  const puntos = [];
  const titulo = video.titulo.toLowerCase();
  
  if (titulo.includes('tutorial') || titulo.includes('cómo')) {
    puntos.push('Contenido educativo paso a paso');
    puntos.push('Incluye ejemplos prácticos demostrados');
  }
  if (titulo.includes('review') || titulo.includes('comparativa')) {
    puntos.push('Análisis detallado de características');
    puntos.push('Comparación con alternativas del mercado');
  }
  if (titulo.includes('workflow')) {
    puntos.push('Presenta un flujo de trabajo optimizado');
    puntos.push('Ideal para mejorar la productividad');
  }
  if (video.tags?.includes('prompt') || video.tags?.includes('prompting')) {
    puntos.push('Técnicas avanzadas de prompting');
    puntos.push('Estrategias para mejores resultados');
  }
  
  if (puntos.length === 0) {
    puntos.push('Contenido relevante sobre IA generativa');
    puntos.push('Aporta valor educativo o práctico');
  }
  
  return `${base}Puntos clave:\n• ${puntos.join('\n• ')}\n\n💡 Recomendación: Ver con atención los timestamps marcados para aprovechar al máximo el contenido.`;
}

/**
 * Exporta los videos a formato JSON
 */
export function exportarJSON(videos) {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalVideos: videos.length,
    videos: videos
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Exporta los videos a formato CSV
 */
export function exportarCSV(videos) {
  const headers = ['ID', 'Video ID', 'Título', 'Canal', 'URL', 'Categoría', 'Estado', 'Valoración', 'Duración', 'Tags', 'Fecha Guardado', 'Notas'];
  const rows = videos.map(v => [
    v.id,
    v.video_id,
    `"${(v.titulo || '').replace(/"/g, '""')}"`,
    `"${(v.canal || '').replace(/"/g, '""')}"`,
    v.url,
    v.categoria,
    v.estado,
    v.valoracion || 0,
    v.duracion || '',
    `"${(v.tags || []).join(', ')}"`,
    v.fecha_guardado,
    `"${(v.notas_personales || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Descarga un archivo en el navegador
 */
export function descargarArchivo(contenido, nombre, tipo = 'application/json') {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
