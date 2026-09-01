'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Zap, AlertCircle, RefreshCw } from 'lucide-react';

interface BarcodeScannerModalProps {
  onScanSuccess: (scannedText: string) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = 'html5-qrcode-reader-region';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
        ];

        html5QrCode = new Html5Qrcode(regionId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Beep / Vibrate feedback
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(100);
            }
            onScanSuccess(decodedText.trim());
            stopScanner();
            onClose();
          },
          (errorMessage) => {
            // scanning frame error (ignore continuous scan logs)
          }
        );
      } catch (err: any) {
        console.error('Camera start error:', err);
        setErrorMsg('ບໍ່ສາມາດເປີດກ້ອງໄດ້ ກະລຸນາອະນຸຍາດການເຂົ້າເຖິງກ້ອງໃນ Browser');
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon/15 text-neon border border-neon/30 flex items-center justify-center shadow-neon-sm">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                ສະແກນບາໂຄ້ດ / QR Code
              </h3>
              <p className="text-[10px] text-neon">ກ້ອງພ້ອມສະແກນເລກແທຣັກກິ້ງ</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Camera Region */}
        <div className="relative bg-black p-2 min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={regionId} className="w-full rounded-2xl overflow-hidden"></div>

          {/* Laser Line Scanning Effect */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-44 border-2 border-dashed border-neon/60 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-neon">
            <div className="w-full h-0.5 bg-neon shadow-neon animate-pulse"></div>
            <div className="text-center text-[10px] font-bold text-neon bg-black/60 px-2 py-0.5 rounded mx-auto backdrop-blur-sm">
              ວາງບາໂຄ້ດ ຫຼື QR Code ໃສ່ໃນກອບ
            </div>
          </div>
        </div>

        {/* Error / Instructions */}
        <div className="p-4 bg-slate-900/90 text-center space-y-2">
          {errorMsg ? (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-300 font-medium">
              ຮອງຮັບບາໂຄ້ດຂົນສົ່ງຈີນ (SF, ZTO, Shein) & ໄທ (Flash, Kerry) & QR Code
            </p>
          )}

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            ປິດໜ້າຈໍສະແກນ
          </button>
        </div>
      </div>
    </div>
  );
};
