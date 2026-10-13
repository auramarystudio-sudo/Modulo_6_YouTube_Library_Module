// ============================================
// Búsqueda Semántica - Módulo 6
// Búsqueda por conceptos, no solo palabras exactas
// ============================================

/**
 * Mapa de sinónimos y conceptos relacionados
 * Expande la búsqueda para incluir términos relacionados
 */
const SINONIMOS = {
  'calidad de imagen': ['upscaling', 'upscale', 'mejorar imagen', 'high quality', 'hq', 'super resolution', 'enhance'],
  'generar imagen': ['text to image', 'txt2img', 'generación de imagen', 'crear imagen', 'image generation'],
  'editar imagen': ['inpainting', 'outpainting', 'edición', 'modify', 'cambiar', 'retocar'],
  'entrenar modelo': ['fine-tuning', 'finetuning', 'entrenamiento', 'training', 'lora', 'dreambooth', 'textual inversion'],
  'control de pose': ['controlnet', 'control net', 'pose', 'openpose', 'control de postura'],
  'consistencia de personaje': ['ipadapter', 'ip adapter', 'consistent character', 'personaje consistente', 'roop', 'face swap'],
  'prompting': ['prompt', 'prompt engineering', 'ingeniería de prompts', 'descripción', 'texto guía'],
  'modelo de lenguaje': ['llm', 'large language model', 'gpt', 'claude', 'gemini', 'chatbot', 'asistente ia'],
  'generar texto': ['text generation', 'escritura', 'writing', 'redacción', 'contenido'],
  'generar video': ['video generation', 'text to video', 'animación', 'sora', 'runway', 'pika'],
  'generar audio': ['tts', 'text to speech', 'voz', 'speech synthesis', 'elevenlabs', 'audio generation'],
  'generar música': ['music generation', 'udio', 'suno', 'composición', 'melodía'],
  'workflow': ['flujo de trabajo', 'proceso', 'pipeline', 'comfyui', 'automatización'],
  'instalación': ['setup', 'configuración', 'instalar', 'install', 'config'],
  'optimización': ['optimizar', 'performance', 'rendimiento', 'velocidad', 'rápido', 'fast'],
  'api': ['api', 'integración', 'programación', 'código', 'developer', 'desarrollo'],
  'local': ['local', 'offline', 'en tu pc', 'tu computadora', 'self-hosted', 'privado'],
  'nube': ['cloud', 'online', 'servicio', 'saas', 'web app', 'remoto'],
  'gratis': ['free', 'gratuito', 'open source', 'código abierto', 'sin costo'],
  'pago': ['paid', 'premium', 'suscripción', 'subscription', 'pro', 'profesional']
};

/**
 * Expande un término de búsqueda con sinónimos
 */
export function expandirBusqueda(termino) {
  const terminoLower = termino.toLowerCase().trim();
  const expansiones = [terminoLower];
  
  // Buscar en el mapa de sinónimos
  for (const [concepto, sinonimos] of Object.entries(SINONIMOS)) {
    if (terminoLower.includes(concepto) || sinonimos.some(s => terminoLower.includes(s))) {
      expansiones.push(concepto, ...sinonimos);
    }
  }
  
  // Eliminar duplicados
  return [...new Set(expansiones)];
}

/**
 * Calcula la relevancia de un video para un término de búsqueda
 * Retorna un score de 0 a 1
 */
export function calcularRelevancia(video, terminos) {
  let score = 0;
  const textoVideo = [
    video.titulo || '',
    video.canal || '',
    video.notas_personales || '',
    (video.tags || []).join(' ')
  ].join(' ').toLowerCase();
  
  for (const termino of terminos) {
    if (textoVideo.includes(termino)) {
      score += 1;
      
      // Bonus si está en el título
      if ((video.titulo || '').toLowerCase().includes(termino)) {
        score += 0.5;
      }
      
      // Bonus si está en los tags
      if ((video.tags || []).some(tag => tag.toLowerCase().includes(termino))) {
        score += 0.3;
      }
    }
  }
  
  return score;
}

/**
 * Búsqueda semántica en la biblioteca
 * Expande el término y ordena por relevancia
 */
export function busquedaSemantica(videos, termino) {
  if (!termino.trim()) return videos;
  
  const terminosExpandidos = expandirBusqueda(termino);
  
  // Calcular relevancia para cada video
  const videosConScore = videos.map(video => ({
    video,
    score: calcularRelevancia(video, terminosExpandidos)
  }));
  
  // Filtrar videos con score > 0 y ordenar por relevancia
  return videosConScore
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.video);
}

/**
 * Sugiere términos de búsqueda basados en la biblioteca
 */
export function sugerirTerminosBusqueda(videos) {
  const frecuencias = {};
  
  videos.forEach(video => {
    // Contar tags
    (video.tags || []).forEach(tag => {
      frecuencias[tag] = (frecuencias[tag] || 0) + 1;
    });
    
    // Contar categorías
    if (video.categoria) {
      frecuencias[video.categoria] = (frecuencias[video.categoria] || 0) + 1;
    }
  });
  
  // Retornar los términos más frecuentes
  return Object.entries(frecuencias)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([termino, frecuencia]) => ({ termino, frecuencia }));
}
