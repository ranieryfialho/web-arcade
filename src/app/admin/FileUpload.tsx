'use client';

import { useState, ChangeEvent } from 'react';
import { Image as ImageIcon, FileCode, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  iconType: 'image' | 'rom';
}

export function FileUpload({ name, label, accept, required, iconType }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      if (iconType === 'image') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const Icon = iconType === 'image' ? ImageIcon : FileCode;

  const heightClass = iconType === 'image' ? 'h-80' : 'h-80';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary flex justify-between">
        {label}
        {!required && <span className="text-xs text-text-muted lowercase font-normal">(Opcional)</span>}
      </label>
      
      <label className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all text-center overflow-hidden group ${heightClass}
        ${fileName
          ? 'border-brand-primary/50 bg-background-secondary/50' 
          : 'border-background-tertiary bg-background-secondary/20 hover:border-brand-primary hover:bg-background-tertiary/40'
        }`}>

        {previewUrl ? (
          <div className="relative h-full w-full p-2">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-full w-full object-contain drop-shadow-lg" 
            />
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <div className="flex flex-col items-center text-white">
                <ImageIcon className="mb-2 h-8 w-8" />
                <span className="text-sm font-bold">Clique para trocar</span>
              </div>
            </div>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center animate-in zoom-in-90 duration-200 p-6">
             <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <span className="text-sm font-bold text-text-primary break-all line-clamp-2 px-4">
                {fileName}
             </span>
             <span className="mt-2 text-xs text-brand-primary">Arquivo pronto para envio</span>
          </div>
        ) : (
          <div className="flex flex-col items-center p-6 text-text-muted group-hover:text-brand-primary transition-colors">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-tertiary group-hover:bg-brand-primary/10 transition-colors">
               <Icon className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">
              {required ? 'Clique para selecionar' : 'Clique para alterar'}
            </span>
            <span className="mt-1 text-xs text-text-muted opacity-70">
              {iconType === 'image' ? 'JPG, PNG, WEBP' : '.SMC, .GBA, .ZIP'}
            </span>
          </div>
        )}

        <input
          name={name}
          type="file"
          accept={accept}
          required={required && !fileName}
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}