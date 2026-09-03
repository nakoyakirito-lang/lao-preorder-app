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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-300 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ສະແກນບາໂຄ້ດ / QR Code ບິນ
              </h3>
              <p className="text-[10px] text-slate-500">ກ້ອງພ້ອມສະແກນເລກແທຣັກກິ້ງ</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Camera Region */}
        <div className="relative bg-slate-950 p-2 min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={regionId} className="w-full rounded-2xl overflow-hidden"></div>

          {/* Laser Line Scanning Effect */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-44 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-sm">
            <div className="w-full h-0.5 bg-red-500 shadow-sm animate-pulse"></div>
            <div className="text-center text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded mx-auto backdrop-blur-sm">
              ວາງບາໂຄ້ດ ຫຼື QR Code ໃສ່ໃນກອບ
            </div>
          </div>
        </div>

        {/* Error / Instructions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center space-y-2.5">
          {errorMsg ? (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-600 font-medium">
              ຮອງຮັບບາໂຄ້ດຂົນສົ່ງຈີນ (SF, ZTO) & ໄທ (Flash, Kerry) & QR ບິນລາວ
            </p>
          )}

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-full py-2.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            ປິດໜ້າຈໍສະແກນ
          </button>
        </div>
      </div>
    </div>
  );
};
