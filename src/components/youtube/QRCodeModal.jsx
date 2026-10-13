// ============================================
// QRCode.jsx - Generador de códigos QR
// Para compartir videos/colecciones al móvil
// ============================================

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { 
  X, QrCode, Download, Copy, Check,
  Smartphone, Link
} from 'lucide-react';
import { generarURLVideo } from '../../utils/youtube-utils';

export default function QRCodeModal({ video, coleccion, onClose }) {
  const [copiado, setCopiado] = useState(false);

  // Determinar URL para el QR
  const url = video 
    ? (video.url || generarURLVideo(video.video_id))
    : coleccion 
      ? `${window.location.origin}?coleccion=${coleccion.id}`
      : window.location.origin;

  const titulo = video 
    ? video.titulo 
    : coleccion 
      ? coleccion.nombre 
      : 'Biblioteca de YouTube';

  // Copiar URL al portapapeles
  const copiarURL = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Descargar QR como imagen
  const descargarQR = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `qr-${video?.video_id || coleccion?.id || 'biblioteca'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            Código QR
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
          {/* Título */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">
              {video ? 'Video' : coleccion ? 'Colección' : 'Biblioteca'}
            </p>
            <p className="text-lg font-semibold text-slate-200 line-clamp-2">
              {titulo}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <QRCode
                id="qr-code-svg"
                value={url}
                size={200}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">
                  Escanea con tu móvil
                </p>
                <p className="text-xs text-slate-500">
                  Abre la cámara de tu teléfono y apunta al código QR para acceder rápidamente.
                </p>
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">URL</span>
            </div>
            <p className="text-xs text-slate-400 break-all font-mono">
              {url}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={copiarURL}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white text-sm font-medium transition"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar URL
                </>
              )}
            </button>
            <button
              onClick={descargarQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition shadow-lg"
            >
              <Download className="w-4 h-4" />
              Descargar QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
