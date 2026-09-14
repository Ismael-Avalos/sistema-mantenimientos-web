import { useRef, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Laptop, MapPin, Tag, QrCode } from "lucide-react";
import type { Equipo } from "../../types/Equipo";

interface ModalQrEquipoProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
}
// Si VITE_APP_URL está definida la usa, de lo contrario cae en window.location.origin
const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

export function ModalQrEquipo({ isOpen, onClose, equipo }: ModalQrEquipoProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  // Cerrar modal al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !equipo) return null;

  // Extraemos el identificador único (UUID)
  const uuid = (equipo as any).qrUuid || (equipo as any).uuid || equipo.id;

  // URL estática que leerá el teléfono al escanear
  const qrUrl = `${baseUrl}/mantenimiento/qr/${uuid}`;

  // Descarga del QR como archivo PNG
  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || descargando) return;
    setDescargando(true);
    setErrorDescarga(null);
    try {
      // Incrustar el logo evita que la exportación dependa de imágenes externas.
      const response = await fetch(`${import.meta.env.BASE_URL}android-chrome-512x512.png`);
      if (!response.ok) throw new Error("No se pudo cargar el logo");
      const blob = await response.blob();
      const logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      const copia = svg.cloneNode(true) as SVGSVGElement;
      copia.setAttribute("width", "1050");
      copia.setAttribute("height", "1050");
      const imagenLogo = copia.querySelector("image");
      imagenLogo?.setAttribute("href", logo);
      imagenLogo?.setAttributeNS("http://www.w3.org/1999/xlink", "href", logo);
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copia))}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1050;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo generar el PNG");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 1050, 1050);
      context.drawImage(image, 0, 0, 1050, 1050);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `QR-${equipo.codigoInventario}.png`;
      link.click();
    } catch {
      setErrorDescarga("No se pudo descargar el QR con el logo. Intenta nuevamente.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-qr-titulo"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Encabezado Fijo */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
            <QrCode className="w-5 h-5 text-red-800 dark:text-red-300" />
            <h2 id="modal-qr-titulo" className="text-base sm:text-lg">Código QR de Activo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de código QR"
            className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta / Vista previa del Sticker (Scrolleable en pantallas muy pequeñas) */}
        <div className="p-4 sm:p-6 text-center space-y-4 overflow-y-auto flex-1">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 flex flex-col items-center">
            
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider mb-1">
              Control de Activos
            </p>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
              {equipo.nombre}
            </h3>
            <p className="font-mono text-xs font-semibold text-red-800 dark:text-red-300 mb-4">
              {equipo.codigoInventario}
            </p>

            {/* Visualización vectorial del QR */}
            <div ref={qrRef} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <QRCodeSVG
                value={qrUrl}
                size={160}
                level="H" // Corrección de errores alta por si se daña físicamente la etiqueta
                marginSize={4}
                imageSettings={{
                  src: `${import.meta.env.BASE_URL}android-chrome-512x512.png`,
                  width: 28,
                  height: 28,
                  excavate: true,
                }}
              />
            </div>

            {/* Datos complementarios del activo */}
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 w-full text-left bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                <span className="truncate">{equipo.marca} {equipo.modelo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
                <span className="truncate">S/N: {equipo.serialEquipo || "Sin serie"}</span>
              </div>
              {equipo.ubicacion && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-800 dark:text-red-300 shrink-0" />
                  <span className="truncate">{equipo.ubicacion.nombre}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {errorDescarga && <p role="alert" className="px-5 pb-3 text-sm text-red-700 dark:text-red-300">{errorDescarga}</p>}
        {/* Botones de Acción (Pie Fijo) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 px-5 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-xl transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={descargando}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-xl transition-colors shadow-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 dark:focus-visible:ring-red-400"
          >
            <Download className="w-4 h-4" />
            <span>{descargando ? "Generando PNG..." : "Descargar PNG"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
