import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

interface ImageDropZoneProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  className?: string;
  aspectRatioClassName?: string;
}

export default function ImageDropZone({
  value,
  onChange,
  label,
  className = '',
  aspectRatioClassName = 'aspect-video'
}: ImageDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Format non supporté. Veuillez charger uniquement des images (PNG, JPEG, etc.).");
      return;
    }
    
    // Check file size, warning if it is exceptionally large to avoid Firestore packet limits (max 1MB is safe, though Firestore limits documents to 1MB)
    if (file.size > 800000) {
      alert("Attention: L'image est un peu lourde (>800 Ko). Pour des performances de chargement optimales, privilégiez une version compressée.");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      if (b64) {
        onChange(b64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <span className="block text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
          {label}
        </span>
      )}
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative ${aspectRatioClassName} rounded-none border border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-4 text-center group ${
          isDragActive 
            ? 'border-black bg-neutral-50' 
            : value 
              ? 'border-gray-200 bg-white hover:border-gray-400' 
              : 'border-gray-300 bg-neutral-50/50 hover:bg-neutral-50 hover:border-gray-400'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          className="hidden" 
          onChange={handleFileInputChange}
        />

        {value ? (
          <>
            {/* Preview image */}
            <img 
              src={value} 
              alt="Uploaded Preview" 
              className="absolute inset-0 w-full h-full object-cover object-center filter group-hover:brightness-95 transition-all"
              referrerPolicy="no-referrer"
            />
            {/* Floating actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300 z-10">
              <span className="text-[10px] text-white px-2.5 py-1 bg-black/80 font-bold uppercase tracking-widest border border-white/20">
                Changer l'image
              </span>
              <button
                type="button"
                onClick={clearImage}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-none border border-red-500 shadow-lg"
                title="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2 py-4 select-none">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
              <UploadCloud className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-gray-900">
                Glissez-déposez un fichier ici
              </p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                ou cliquez pour parcourir
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual text-input for URLs if they want to paste standard links */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={value.startsWith('data:') ? 'Fichier chargé localement (Base64)' : value}
            disabled={value.startsWith('data:')}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ou collez une adresse URL d'image existante..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-black rounded-none placeholder-gray-300 font-medium"
          />
        </div>
        {value.startsWith('data:') && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 border border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
