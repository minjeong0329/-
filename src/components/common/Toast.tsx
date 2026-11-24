import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 max-w-[390px] mx-auto px-4 pointer-events-none flex flex-col items-center space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`pointer-events-auto px-4 py-2.5 rounded-full text-xs font-semibold shadow-lifted border flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200 cursor-pointer ${
            toast.type === 'success'
              ? 'bg-[#EDF4E4] border-[#B8CE90] text-[#586A41]'
              : toast.type === 'warning'
              ? 'bg-[#FDF0EB] border-[#F8C8B9] text-[#B35D43]'
              : 'bg-white border-[#E3DFD4] text-[#292D27]'
          }`}
        >
          <span>
            {toast.type === 'success' ? '🌱' : toast.type === 'warning' ? '⏰' : '🔔'}
          </span>
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
