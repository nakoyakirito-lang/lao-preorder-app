'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, Zap, AlertCircle, RefreshCw, Upload, Image as ImageIcon, Volume2, Keyboard } from 'lucide-react';

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
  const [manualCode, setManualCode] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [scanEngine, setScanEngine] = useState<string>('ກຳລັງເລີ່ມກ້ອງ...');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isStoppedRef = useRef<boolean>(false);

  // Play crisp logistic beep sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime); // 1800Hz pleasant beep
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {}
  };

  const handleSuccess = (code: string) => {
    if (isStoppedRef.current) return;
    isStoppedRef.current = true;
    playBeep();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(120);
    }
    stopAllTracks();
    onScanSuccess(code.trim());
    onClose();
  };

  const stopAllTracks = () => {
    isStoppedRef.current = true;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    isStoppedRef.current = false;

    const startCameraAndScan = async () => {
      try {
        setErrorMsg('');
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          if ((capabilities as any).torch) {
            setHasTorch(true);
          }
        }

        // Check if browser has Native BarcodeDetector
        const hasNativeBarcodeDetector =
          typeof window !== 'undefined' && 'BarcodeDetector' in window;

        if (hasNativeBarcodeDetector) {
          setScanEngine('⚡ Native Hardware Scanner (Ultra-Fast)');
          try {
            const formats = [
              'code_128',
              'code_39',
              'code_93',
              'ean_13',
              'ean_8',
              'itf',
              'qr_code',
              'upc_a',
              'upc_e',
              'data_matrix',
            ];
            const barcodeDetector = new (window as any).BarcodeDetector({ formats });

            const detectFrame = async () => {
              if (isStoppedRef.current || !videoRef.current) return;
              try {
                if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const found = barcodes[0].rawValue;
                    if (found) {
                      handleSuccess(found);
                      return;
                    }
                  }
                }
              } catch (err) {}
              if (!isStoppedRef.current) {
                animFrameIdRef.current = requestAnimationFrame(detectFrame);
              }
            };
            detectFrame();
            return;
          } catch (e) {
            console.warn('Native detector init failed, fallback to ZXing:', e);
          }
        }

        // Fallback to ZXing MultiFormatReader
        setScanEngine('📦 ZXing Logistics Barcode Engine');
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.ITF,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.DATA_MATRIX,
        ]);

        const reader = new BrowserMultiFormatReader(hints, 250);
        zxingReaderRef.current = reader;

        if (videoRef.current) {
          reader.decodeContinuously(videoRef.current, (result, err) => {
            if (result && !isStoppedRef.current) {
              handleSuccess(result.getText());
            }
          });
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setErrorMsg('ບໍ່ສາມາດເປີດກ້ອງໄດ້ ກະລຸນາອະນຸຍາດ (Allow Camera) ຫຼື ໃຊ້ປຸ່ມເລືອກຮູບ/ປ້ອນເລກແທນ');
      }
    };

    startCameraAndScan();

    return () => {
      stopAllTracks();
    };
  }, []);

  const handleToggleTorch = async () => {
    if (streamRef.current && hasTorch) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !isTorchOn } as any],
          });
          setIsTorchOn(!isTorchOn);
        } catch (e) {
          console.warn('Torch toggle error:', e);
        }
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;
      img.onload = async () => {
        // 1. Try Native BarcodeDetector on image
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector();
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              handleSuccess(barcodes[0].rawValue);
              return;
            }
          } catch (e) {}
        }

        // 2. Try ZXing
        try {
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageElement(img);
          if (result && result.getText()) {
            handleSuccess(result.getText());
            return;
          }
        } catch (e) {
          setErrorMsg('ບໍ່ພົບເສັ້ນບາໂຄ້ດໃນຮູບ ກະລຸນາລອງຖ່າຍຮູບໃໝ່ໃຫ້ຊັດເຈນ ຫຼື ປ້ອນເລກແທຣັກກິ້ງໂດຍກົງ');
        }
      };
    } catch (err) {
      console.error('File scan error:', err);
      setErrorMsg('ບໍ່ສາມາດອ່ານຮູບພາບໄດ້');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fadeIn">
      <div className="w-full max-w-sm bg-white border border-slate-300 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ສະແກນບາໂຄ້ດ & QR ບິນ
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold">{scanEngine}</p>
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
                stopAllTracks();
                onClose();
              }}
              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Viewfinder Area */}
        <div className="relative bg-slate-950 min-h-[320px] max-h-[380px] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover min-h-[320px]"
            muted
            playsInline
          />

          {/* Logistics Target Box & Scanning Laser */}
          <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-44 border-2 border-dashed border-emerald-400/90 rounded-2xl pointer-events-none flex flex-col justify-between p-2.5 shadow-lg">
            <div className="w-full h-0.5 bg-red-500 shadow-md animate-pulse"></div>
            <div className="text-center text-[10px] font-extrabold text-white bg-black/75 px-3 py-0.5 rounded-full mx-auto backdrop-blur-md">
              ຈໍ່ເສັ້ນບາໂຄ້ດຂົນສົ່ງໃສ່ໃນກອບ
            </div>
          </div>
        </div>

        {/* Action Controls & Fallbacks */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span className="text-[11px] font-semibold leading-tight">{errorMsg}</span>
            </div>
          )}

          {showManualInput ? (
            <div className="flex gap-1.5 animate-fadeIn">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="ປ້ອນເລກພັດສະດຸ/ບິນ..."
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualCode.trim()) {
                    handleSuccess(manualCode.trim());
                  }
                }}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
              >
                ຕົກລົງ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Image Upload Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-2 bg-white border border-slate-300 hover:border-slate-900 rounded-xl text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <ImageIcon size={14} />
                <span>ເລືອກຮູບໃບບິນ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="py-2.5 px-2 bg-white border border-slate-300 hover:border-slate-900 rounded-xl text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <Keyboard size={14} />
                <span>ພິມເລກເອງ</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              stopAllTracks();
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
