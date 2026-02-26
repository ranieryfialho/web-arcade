'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { deleteAccount } from '@/app/profile/actions';

export function DeleteAccountSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAccount();
      
      if (result?.error) {
        alert(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        window.location.href = '/login'; 
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 rounded-2xl border border-red-500/30 bg-red-950/10 p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-red-500 flex items-center gap-2">
        <AlertTriangle size={24} />
        Danger Zone
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        A exclusão da sua conta é irreversível. Todos os seus dados, saves na nuvem, conquistas e perfil serão perdidos para sempre.
      </p>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        Excluir Minha Conta
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Conta Permanentemente?"
        description="Você tem certeza absoluta? Esta ação não pode ser desfeita. Todos os seus dados, saves e conquistas serão apagados do Web Arcade."
        variant="danger"
        confirmLabel="Sim, excluir minha conta"
        isLoading={isLoading}
      />
    </div>
  );
}