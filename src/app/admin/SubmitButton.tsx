'use client';

import { useFormStatus } from 'react-dom';
import { Save, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  text?: string;
  loadingText?: string;
}

export function SubmitButton({ 
  text = 'Cadastrar Jogo', 
  loadingText = 'Processando...' 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-3 font-bold text-white transition-all hover:bg-brand-secondary disabled:opacity-50"
    >
      {pending ? (
        <>
            <Loader2 size={20} className="animate-spin" /> 
            {loadingText}
        </>
      ) : (
        <>
            <Save size={20} /> 
            {text}
        </>
      )}
    </button>
  );
}