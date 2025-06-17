import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}; 