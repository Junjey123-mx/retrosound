'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropMotion, modalMotion } from '@/lib/motion';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof sizeMap;
  maxWidth?: string;
}

export function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  maxWidth,
}: FormModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const widthClass = maxWidth ?? sizeMap[size ?? 'md'];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
          <motion.div
            variants={backdropMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-slate-900/45"
            onClick={onClose}
          />
          <motion.div
            variants={modalMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative flex w-full flex-col ${widthClass} max-h-[90dvh] rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-border dark:bg-card dark:text-foreground`}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-border">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-foreground">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                type="button"
                className="ml-4 mt-0.5 shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rs-bg-soft hover:text-slate-800 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-border">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
