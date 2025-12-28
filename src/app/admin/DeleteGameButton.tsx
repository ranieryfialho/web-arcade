'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteGame } from './actions';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface DeleteGameButtonProps {
  id: string;
  title: string;
}

export function DeleteGameButton({ id, title }: DeleteGameButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteGame(id);
        
        if (result?.error) {
          alert(`Erro ao deletar: ${result.error}`);
        } else {
          setShowModal(false);
        }
      } catch (e) {
        alert('Erro inesperado ao tentar deletar.');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Excluir Jogo"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>

      <ConfirmationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Excluir Jogo?"
        description={`Tem certeza que deseja remover "${title}"? Essa ação apagará o jogo, saves e favoritos de todos os usuários.`}
        isLoading={isPending}
        variant="danger"
        confirmLabel="Sim, excluir"
      />
    </>
  );
}