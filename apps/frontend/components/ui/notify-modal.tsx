'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface NotifyModalProps {
  type:    'success' | 'error';
  title:   string;
  message: string;
  onClose: () => void;
}

export function NotifyModal({ type, title, message, onClose }: NotifyModalProps) {
  const isSuccess = type === 'success';

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [isSuccess, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-2xl"
      >
        <div
          className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 ${
            isSuccess
              ? 'border-success/40 bg-success/8'
              : 'border-danger/40 bg-danger/8'
          }`}
        >
          {isSuccess
            ? <CheckCircle2 className="h-12 w-12 text-success" />
            : <XCircle     className="h-12 w-12 text-danger" />
          }
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{message}</p>

        {!isSuccess && (
          <button
            onClick={onClose}
            className="mt-6 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover active:scale-[0.97]"
          >
            Aceptar
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
