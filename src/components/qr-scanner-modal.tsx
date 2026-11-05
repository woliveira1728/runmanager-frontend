'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (decodedText: string) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onDetected,
}: QrScannerModalProps) {
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function startCamera() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        setCameraError(null);
        const html5QrCode = new Html5Qrcode('qr-reader-viewport');
        scannerRef.current = html5QrCode;
        setIsScanning(true);

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            if (!isMounted) return;
            html5QrCode
              .stop()
              .then(() => html5QrCode.clear())
              .catch(() => {});
            scannerRef.current = null;
            onDetected(decodedText.trim());
          },
          () => {
            // Ignora frames intermediários sem QR Code
          },
        );
      } catch {
        if (isMounted) {
          setIsScanning(false);
          setCameraError(
            'Câmera não detectada ou permissão negada neste navegador. Você pode enviar uma imagem do QR Code abaixo.',
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const ref = scannerRef.current;
        scannerRef.current = null;
        ref
          .stop()
          .then(() => ref.clear())
          .catch(() => {});
      }
    };
  }, [isOpen, onDetected]);

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const fileScanner = new Html5Qrcode('qr-file-reader-hidden');
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      onDetected(decodedText.trim());
    } catch {
      setCameraError(
        'Não foi possível identificar um QR Code válido na imagem selecionada.',
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Escanear QR Code do Atleta
              </h3>
              <p className="text-[11px] text-slate-500">
                Aponte a câmera para o bilhete digital do atleta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            id="qr-reader-viewport"
            className="w-full min-h-[240px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center text-xs text-slate-400 border border-slate-800"
          >
            {!isScanning && !cameraError && 'Inicializando câmera...'}
          </div>
          <div id="qr-file-reader-hidden" className="hidden" />

          {cameraError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition">
              <Upload className="h-3.5 w-3.5 text-blue-600" />
              <span>Ler Imagem de QR Code</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageScan}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
