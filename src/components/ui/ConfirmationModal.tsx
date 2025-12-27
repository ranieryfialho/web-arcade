'use client';

import { AlertTriangle, X, Loader2, Info, LogIn } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
  cancelLabel?: string;
  confirmLabel?: string;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  isLoading,
  variant = 'danger',
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-background-tertiary bg-background-card p-6 text-left shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border
            ${isDanger 
              ? 'bg-red-950/50 border-red-500/20 text-red-500' 
              : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
            }`}
          >
            {isDanger ? <AlertTriangle size={24} /> : <LogIn size={24} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary leading-6">
              {title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-background-tertiary bg-background-secondary px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background-tertiary transition-colors disabled:opacity-50 sm:w-auto w-full"
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 sm:w-auto w-full
              ${isDanger 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-brand-primary hover:bg-brand-secondary'
              }`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? (isDanger ? 'Processando...' : 'Carregando...') : confirmLabel}
          </button>
        </div>

        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-background-tertiary transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}