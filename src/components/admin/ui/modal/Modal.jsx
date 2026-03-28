// src/components/admin/ui/modal/Modal.jsx

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, className, closeOnOutsideClick = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (event) => {
        if (event.key === 'Escape' && closeOnOutsideClick) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose, closeOnOutsideClick]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={() => {
        if (closeOnOutsideClick) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={`bg-background rounded-2xl p-6 shadow-xl max-w-2xl w-full relative border border-red-200 overflow-y-auto max-h-[90vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-red-600" />
        </button>

        {title && (
          <h2
            id="modal-title"
            className="text-xl font-bold text-red-700 mb-6 border-b pb-3 border-red-200"
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}