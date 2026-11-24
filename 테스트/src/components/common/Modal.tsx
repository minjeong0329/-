import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { sound } from '../../lib/sound';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-md'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#292D27]/40 backdrop-blur-[2px]">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] bg-[#F8F7F2] rounded-t-3xl sm:rounded-2xl border border-[#E3DFD4] shadow-lifted flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-200`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E5D8] flex items-center justify-between bg-white/80">
          <h2 className="text-base font-bold text-[#292D27]">{title}</h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#686E63] hover:text-[#292D27] active:scale-95"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
