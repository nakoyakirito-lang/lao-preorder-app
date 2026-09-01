'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'wide';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  sublabel,
  value,
  onChange,
  aspectRatio = 'square',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200">{label}</label>
        {sublabel && <span className="text-[10px] text-slate-400">{sublabel}</span>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div
          className={`relative rounded-xl overflow-hidden border border-slate-700 group ${
            aspectRatio === 'square' ? 'h-32' : 'h-24'
          } bg-slate-900 flex items-center justify-center`}
        >
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-red-400 border border-red-500/40 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => onChange(reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
            dragActive
              ? 'border-neon bg-neon/10'
              : 'border-slate-800 bg-surface/60 hover:border-slate-700 hover:bg-surface'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-neon flex items-center justify-center border border-slate-700">
            <Camera size={18} />
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-300">
              ກົດເພື່ອຖ່າຍ / ເລືອກຮູບ
            </span>
            <span className="text-[10px] text-slate-500 block">
              PNG, JPG, WebP (ຮອງຮັບວາງ Paste ໄດ້)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
