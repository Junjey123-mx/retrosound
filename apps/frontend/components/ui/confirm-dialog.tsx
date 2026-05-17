'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { backdropMotion, modalMotion } from '@/lib/motion';

type Variant = 'danger' | 'warning' | 'default';

const iconClass: Record<Variant, string> = {
  default: 'bg-brand/10 text-brand',
  danger:  'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
};

const btnClass: Record<Variant, string> = {
  default: 'bg-brand hover:bg-brand-hover',
  danger:  'bg-danger hover:bg-danger/90',
  warning: 'bg-warning hover:bg-warning/90',
};

interface ConfirmDialogProps {
  open: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const handleCancel = onCancel ?? onClose ?? (() => {});

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
          <motion.div
            variants={backdropMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <motion.div
            variants={modalMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass[variant]}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-70 ${btnClass[variant]}`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
