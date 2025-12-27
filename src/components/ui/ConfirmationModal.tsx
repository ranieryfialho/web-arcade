'use client';

import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  isLoading 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-background-tertiary bg-background-card p-6 text-left shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-950/50 border border-red-500/20 text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary leading-6">
              {title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-background-tertiary bg-background-secondary px-4 py-2 text-sm font-medium text-text-primary hover:bg-background-tertiary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Apagando...' : 'Sim, excluir'}
          </button>
        </div>

        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}