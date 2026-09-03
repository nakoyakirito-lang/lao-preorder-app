'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Zap, AlertCircle, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const regionId = 'html5-qrcode-reader-region';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.AZTEC,
        ];

        html5QrCode = new Html5Qrcode(regionId, {
          formatsToSupport,
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 20,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.max(250, Math.floor(viewfinderWidth * 0.88)),
              height: Math.max(160, Math.floor(viewfinderHeight * 0.65)),
            };
          },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(100);
            }
            onScanSuccess(decodedText.trim());
            stopScanner();
            onClose();
          },
          () => {}
        );

        // Check torch support
        try {
          const track = html5QrCode.getRunningTrackCapabilities();
          if (track && (track as any).torch) {
            setHasTorch(true);
          }
        } catch (e) {}
      } catch (err: any) {
        console.error('Camera start error:', err);
        setErrorMsg('ບໍ່ສາມາດເປີດກ້ອງໄດ້ ກະລຸນາກວດສອບສິດການເຂົ້າເຖິງກ້ອງໃນ Browser ຫຼື ໃຊ້ປຸ່ມເລືອກຮູບໃບບິນແທນ');
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

  const handleToggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !isTorchOn } as any],
        });
        setIsTorchOn(!isTorchOn);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      if (result) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100);
        }
        onScanSuccess(result.trim());
        stopScanner();
        onClose();
      }
    } catch (err) {
      console.error('Image scan failed:', err);
      setErrorMsg('ບໍ່ພົບເລກບາໂຄ້ດ ຫຼື QR Code ໃນຮູບພາບທີ່ເລືອກ ກະລຸນາລອງຖ່າຍຮູບໃຫ້ຊັດເຈນຂຶ້ນ');
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
                ສະແກນບາໂຄ້ດ / QR ບິນ
              </h3>
              <p className="text-[10px] text-slate-500">ຈໍ່ກ້ອງໃສ່ບາໂຄ້ດຂົນສົ່ງ ຫຼື QR ບິນ</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasTorch && (
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isTorchOn
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
                title="ເປີດ/ປິດ ໄຟແຟລດ"
              >
                <Zap size={16} />
              </button>
            )}
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
        </div>

        {/* Viewfinder Camera Region */}
        <div className="relative bg-slate-950 p-2 min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={regionId} className="w-full rounded-2xl overflow-hidden"></div>

          {/* Laser Line Scanning Effect */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-44 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-sm">
            <div className="w-full h-0.5 bg-red-500 shadow-sm animate-pulse"></div>
            <div className="text-center text-[10px] font-bold text-white bg-black/70 px-2.5 py-0.5 rounded-full mx-auto backdrop-blur-sm">
              ວາງບາໂຄ້ດ ຫຼື QR Code ໃສ່ໃນກອບ
            </div>
          </div>
        </div>

        {/* Action Controls & File Upload */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
          {errorMsg ? (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="text-[11px] leading-tight">{errorMsg}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-600 font-medium text-center">
              ຮອງຮັບບາໂຄ້ດຈີນ (SF, ZTO, Shein), ໄທ (Flash, Kerry) & QR ບິນລາວ
            </p>
          )}

          {/* Image Upload Alternative */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 hover:border-slate-900 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <ImageIcon size={15} />
            <span>📁 ເລືອກຮູບໃບບິນ / ຖ່າຍຮູບຈາກຄັງຮູບ</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-full py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            ປິດໜ້າຈໍສະແກນ
          </button>
        </div>
      </div>
    </div>
  );
};
