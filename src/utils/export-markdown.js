// ============================================
// Exportación a Markdown - Módulo 6
// Genera archivos .md para Obsidian/Notion
// ============================================

import { CATEGORIAS, ESTADOS, generarURLVideo } from './youtube-utils';

/**
 * Exporta un video individual a formato Markdown
 */
export function videoAMarkdown(video) {
  const categoria = CATEGORIAS[video.categoria]?.label || video.categoria;
  const estado = ESTADOS[video.estado]?.label || video.estado;
  
  let md = `# ${video.titulo}\n\n`;
  
  // Metadata
  md += `**Canal:** ${video.canal}\n`;
  md += `**Categoría:** ${categoria}\n`;
  md += `**Estado:** ${estado}\n`;
  md += `**Duración:** ${video.duracion || 'N/A'}\n`;
  md += `**Valoración:** ${'⭐'.repeat(video.valoracion || 0)}${'☆'.repeat(5 - (video.valoracion || 0))}\n`;
  md += `**Fecha guardado:** ${video.fecha_guardado}\n`;
  md += `**URL:** [Ver en YouTube](${video.url || generarURLVideo(video.video_id)})\n\n`;
  
  // Thumbnail
  md += `![Thumbnail](${video.thumbnail})\n\n`;
  
  // Tags
  if (video.tags && video.tags.length > 0) {
    md += `**Tags:** ${video.tags.map(t => `#${t}`).join(' ')}\n\n`;
  }
  
  // Notas personales
  if (video.notas_personales) {
    md += `## 📝 Notas Personales\n\n`;
    md += `${video.notas_personales}\n\n`;
  }
  
  // Timestamps clave
  if (video.timestamps_clave && video.timestamps_clave.length > 0) {
    md += `## ⏱️ Timestamps Clave\n\n`;
    video.timestamps_clave.forEach(ts => {
      md += `- **${ts.tiempo}** - ${ts.descripcion}\n`;
    });
    md += `\n`;
  }
  
  // Metadata para Obsidian (YAML frontmatter)
  const frontmatter = `---
video_id: ${video.video_id}
canal: "${video.canal}"
categoria: ${categoria}
estado: ${estado}
valoracion: ${video.valoracion || 0}
fecha_guardado: ${video.fecha_guardado}
tags: [${(video.tags || []).map(t => `"${t}"`).join(', ')}]
url: ${video.url || generarURLVideo(video.video_id)}
---\n\n`;
  
  return frontmatter + md;
}

/**
 * Exporta una colección completa a Markdown
 */
export function coleccionAMarkdown(coleccion, videos) {
  const videosEnCol = coleccion.orden
    .map(id => videos.find(v => v.id === id))
    .filter(Boolean);
  
  let md = `# ${coleccion.icono || '📁'} ${coleccion.nombre}\n\n`;
  
  if (coleccion.descripcion) {
    md += `${coleccion.descripcion}\n\n`;
  }
  
  md += `**Total de videos:** ${videosEnCol.length}\n`;
  md += `**Fecha de creación:** ${coleccion.fecha_creacion}\n\n`;
  
  md += `---\n\n`;
  
  videosEnCol.forEach((video, idx) => {
    md += `## ${idx + 1}. ${video.titulo}\n\n`;
    md += `**Canal:** ${video.canal} | **Duración:** ${video.duracion || 'N/A'} | **Valoración:** ${'⭐'.repeat(video.valoracion || 0)}\n\n`;
    
    if (video.notas_personales) {
      md += `${video.notas_personales}\n\n`;
    }
    
    if (video.timestamps_clave && video.timestamps_clave.length > 0) {
      md += `**Timestamps:**\n`;
      video.timestamps_clave.forEach(ts => {
        md += `- ${ts.tiempo} - ${ts.descripcion}\n`;
      });
      md += `\n`;
    }
    
    md += `[Ver en YouTube](${video.url || generarURLVideo(video.video_id)})\n\n`;
    md += `---\n\n`;
  });
  
  return md;
}

/**
 * Exporta toda la biblioteca a un archivo Markdown
 */
export function bibliotecaAMarkdown(videos) {
  let md = `# 📚 Biblioteca de YouTube - IA Generativa\n\n`;
  md += `**Total de videos:** ${videos.length}\n`;
  md += `**Fecha de exportación:** ${new Date().toLocaleDateString('es-ES')}\n\n`;
  
  // Resumen por categoría
  const porCategoria = {};
  videos.forEach(v => {
    const cat = CATEGORIAS[v.categoria]?.label || v.categoria;
    porCategoria[cat] = (porCategoria[cat] || 0) + 1;
  });
  
  md += `## 📊 Resumen por Categoría\n\n`;
  Object.entries(porCategoria).forEach(([cat, count]) => {
    md += `- **${cat}:** ${count} videos\n`;
  });
  md += `\n---\n\n`;
  
  // Videos agrupados por categoría
  const categorias = [...new Set(videos.map(v => v.categoria))];
  
  categorias.forEach(cat => {
    const catLabel = CATEGORIAS[cat]?.label || cat;
    const videosCat = videos.filter(v => v.categoria === cat);
    
    md += `## ${CATEGORIAS[cat]?.icono || '📁'} ${catLabel} (${videosCat.length})\n\n`;
    
    videosCat.forEach(video => {
      md += `### ${video.titulo}\n\n`;
      md += `**Canal:** ${video.canal} | **Duración:** ${video.duracion || 'N/A'} | **Estado:** ${ESTADOS[video.estado]?.label || video.estado}\n\n`;
      
      if (video.tags && video.tags.length > 0) {
        md += `**Tags:** ${video.tags.map(t => `#${t}`).join(' ')}\n\n`;
      }
      
      if (video.notas_personales) {
        md += `> ${video.notas_personales.replace(/\n/g, '\n> ')}\n\n`;
      }
      
      md += `[Ver en YouTube](${video.url || generarURLVideo(video.video_id)})\n\n`;
    });
    
    md += `---\n\n`;
  });
  
  return md;
}

/**
 * Descarga un archivo Markdown
 */
export function descargarMarkdown(contenido, nombre) {
  const blob = new Blob([contenido], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombre}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
