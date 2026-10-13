// ============================================
// Servicio de PocketBase - Módulo 6
// Maneja la conexión con PocketBase o modo demo
// ============================================

import PocketBase from 'pocketbase';

// Intentar conectar a PocketBase (si está disponible)
let pb = null;
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

try {
  pb = new PocketBase(POCKETBASE_URL);
} catch (e) {
  console.warn('No se pudo inicializar PocketBase, usando modo demo');
}

// ============================================
// MODO DEMO - Datos en memoria
// ============================================
let demoVideos = [
  {
    id: 'demo-1',
    video_id: 'dQw4w9WgXcQ',
    titulo: 'Introducción a la IA Generativa - Conceptos Fundamentales',
    canal: 'AI Academy',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duracion: '15:30',
    categoria: 'tutorial_basico',
    tags: ['ia', 'generativa', 'introduccion', 'fundamentos'],
    notas_personales: 'Excelente video para empezar. Cubre los conceptos básicos de modelos generativos, transformers y difusión.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Introducción y contexto' },
      { tiempo: '3:15', descripcion: '¿Qué es la IA generativa?' },
      { tiempo: '7:45', descripcion: 'Modelos de difusión explicados' },
      { tiempo: '12:00', descripcion: 'Casos de uso prácticos' }
    ],
    fecha_guardado: '2024-01-15',
    estado: 'visto',
    valoracion: 5
  },
  {
    id: 'demo-2',
    video_id: 'jNQ65tIaKSQ',
    titulo: 'Stable Diffusion XL - Tutorial Completo de Instalación y Uso',
    canal: 'TechArt Pro',
    url: 'https://youtube.com/watch?v=jNQ65tIaKSQ',
    thumbnail: 'https://img.youtube.com/vi/jNQ65tIaKSQ/maxresdefault.jpg',
    duracion: '28:45',
    categoria: 'instalacion',
    tags: ['stable-diffusion', 'sdxl', 'instalacion', 'local'],
    notas_personales: 'Tutorial muy detallado para instalar SDXL localmente. Requiere al menos 8GB de VRAM.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Requisitos del sistema' },
      { tiempo: '4:30', descripcion: 'Descarga de modelos' },
      { tiempo: '12:00', descripcion: 'Configuración de ComfyUI' },
      { tiempo: '20:15', descripcion: 'Primeras generaciones' }
    ],
    fecha_guardado: '2024-01-20',
    estado: 'visto',
    valoracion: 4
  },
  {
    id: 'demo-3',
    video_id: 'kVr7uE7tTcA',
    titulo: 'Workflow Profesional con ComfyUI - De Principiante a Experto',
    canal: 'Creative AI',
    url: 'https://youtube.com/watch?v=kVr7uE7tTcA',
    thumbnail: 'https://img.youtube.com/vi/kVr7uE7tTcA/maxresdefault.jpg',
    duracion: '45:20',
    categoria: 'workflow',
    tags: ['comfyui', 'workflow', 'profesional', 'nodos'],
    notas_personales: 'Workflow avanzado con ControlNet, IPAdapter y Upscaling. Guardar los nodos personalizados.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Estructura del workflow' },
      { tiempo: '8:00', descripcion: 'Nodos de ControlNet' },
      { tiempo: '18:30', descripcion: 'IPAdapter para consistencia' },
      { tiempo: '30:00', descripcion: 'Upscaling y post-procesado' },
      { tiempo: '40:00', descripcion: 'Exportación y optimización' }
    ],
    fecha_guardado: '2024-02-01',
    estado: 'favorito',
    valoracion: 5
  },
  {
    id: 'demo-4',
    video_id: 'abc12345678',
    titulo: 'Prompt Engineering para Midjourney v6 - Guía Definitiva',
    canal: 'Prompt Master',
    url: 'https://youtube.com/watch?v=abc12345678',
    thumbnail: 'https://img.youtube.com/vi/abc12345678/maxresdefault.jpg',
    duracion: '22:10',
    categoria: 'prompt_engineering',
    tags: ['midjourney', 'prompts', 'v6', 'tips'],
    notas_personales: 'Técnicas avanzadas de prompting. Usar --style raw para más control. Los parámetros de peso son clave.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Novedades de v6' },
      { tiempo: '5:00', descripcion: 'Sintaxis de prompts' },
      { tiempo: '12:30', descripcion: 'Parámetros avanzados' },
      { tiempo: '18:00', descripcion: 'Ejemplos prácticos' }
    ],
    fecha_guardado: '2024-02-10',
    estado: 'pendiente_ver',
    valoracion: 0
  },
  {
    id: 'demo-5',
    video_id: 'xyz98765432',
    titulo: 'GPT-4 vs Claude 3 vs Gemini - Comparativa de Modelos 2024',
    canal: 'AI News Daily',
    url: 'https://youtube.com/watch?v=xyz98765432',
    thumbnail: 'https://img.youtube.com/vi/xyz98765432/maxresdefault.jpg',
    duracion: '18:55',
    categoria: 'review_modelos',
    tags: ['gpt4', 'claude', 'gemini', 'comparativa', 'llm'],
    notas_personales: 'Buena comparativa. Claude destaca en código y razonamiento, GPT-4 en versatilidad, Gemini en multimodal.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Overview de modelos' },
      { tiempo: '6:00', descripcion: 'Tests de código' },
      { tiempo: '11:00', descripcion: 'Razonamiento lógico' },
      { tiempo: '15:30', descripcion: 'Capacidades multimodales' }
    ],
    fecha_guardado: '2024-02-15',
    estado: 'visto',
    valoracion: 4
  },
  {
    id: 'demo-6',
    video_id: 'def45678901',
    titulo: 'Novedades IA Febrero 2024 - Sora, Gemini Ultra y Más',
    canal: 'AI Weekly',
    url: 'https://youtube.com/watch?v=def45678901',
    thumbnail: 'https://img.youtube.com/vi/def45678901/maxresdefault.jpg',
    duracion: '12:30',
    categoria: 'noticias',
    tags: ['sora', 'gemini', 'noticias', 'febrero-2024'],
    notas_personales: 'Sora es impresionante para generación de video. Gemini Ultra supera a GPT-4 en algunos benchmarks.',
    timestamps_clave: [
      { tiempo: '0:00', descripcion: 'Resumen del mes' },
      { tiempo: '3:00', descripcion: 'OpenAI Sora' },
      { tiempo: '7:00', descripcion: 'Gemini Ultra' },
      { tiempo: '10:00', descripcion: 'Otras novedades' }
    ],
    fecha_guardado: '2024-02-20',
    estado: 'pendiente_ver',
    valoracion: 3
  }
];

let nextId = 7;

// ============================================
// Funciones del servicio
// ============================================

/**
 * Obtiene todos los videos ordenados por fecha de guardado (más recientes primero)
 */
export async function obtenerVideos() {
  // Intentar con PocketBase real
  if (pb) {
    try {
      const records = await pb.collection('youtube_videos').getFullList({
        sort: '-fecha_guardado'
      });
      return records;
    } catch (e) {
      console.warn('PocketBase no disponible, usando modo demo');
    }
  }
  
  // Fallback: modo demo
  return [...demoVideos].sort((a, b) => 
    new Date(b.fecha_guardado) - new Date(a.fecha_guardado)
  );
}

/**
 * Crea un nuevo video en la biblioteca
 */
export async function crearVideo(videoData) {
  if (pb) {
    try {
      const record = await pb.collection('youtube_videos').create(videoData);
      return record;
    } catch (e) {
      console.warn('PocketBase no disponible, usando modo demo');
    }
  }
  
  // Fallback: modo demo
  const nuevoVideo = {
    ...videoData,
    id: `demo-${nextId++}`,
    fecha_guardado: videoData.fecha_guardado || new Date().toISOString().split('T')[0]
  };
  demoVideos.push(nuevoVideo);
  return nuevoVideo;
}

/**
 * Actualiza un video existente
 */
export async function actualizarVideo(id, videoData) {
  if (pb) {
    try {
      const record = await pb.collection('youtube_videos').update(id, videoData);
      return record;
    } catch (e) {
      console.warn('PocketBase no disponible, usando modo demo');
    }
  }
  
  // Fallback: modo demo
  const index = demoVideos.findIndex(v => v.id === id);
  if (index !== -1) {
    demoVideos[index] = { ...demoVideos[index], ...videoData };
    return demoVideos[index];
  }
  throw new Error('Video no encontrado');
}

/**
 * Elimina un video de la biblioteca
 */
export async function eliminarVideo(id) {
  if (pb) {
    try {
      await pb.collection('youtube_videos').delete(id);
      return true;
    } catch (e) {
      console.warn('PocketBase no disponible, usando modo demo');
    }
  }
  
  // Fallback: modo demo
  demoVideos = demoVideos.filter(v => v.id !== id);
  return true;
}
