'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({ label, className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-foreground">{label}</label>
      )}
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-rs-primary focus:outline-none focus:ring-2 focus:ring-rs-primary/25 dark:border-border dark:bg-input-bg dark:text-foreground transition ${className ?? ''}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-brand"
          tabIndex={-1}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
