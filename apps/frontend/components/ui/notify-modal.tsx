'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface NotifyModalProps {
  type:     'success' | 'error';
  title:    string;
  message:  string;
  onClose:  () => void;
}

export function NotifyModal({ type, title, message, onClose }: NotifyModalProps) {
  const isSuccess = type === 'success';

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [isSuccess, onClose]);

  const iconBorder = isSuccess ? 'rgba(134,239,172,0.45)' : 'rgba(252,165,165,0.45)';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-2xl p-10 text-center shadow-2xl"
        style={{ backgroundColor: 'hsl(var(--card))' }}
      >
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4"
          style={{ borderColor: iconBorder }}
        >
          {isSuccess
            ? <CheckCircle2 className="h-12 w-12 text-green-500" />
            : <XCircle     className="h-12 w-12 text-red-500" />
          }
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{message}</p>

        {!isSuccess && (
          <button
            onClick={onClose}
            className="mt-6 rounded-xl px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'hsl(var(--brand))' }}
          >
            Aceptar
          </button>
        )}
      </div>
    </div>
  );
}
