'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { slideUp } from '@/lib/motion';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  error?: unknown;
}

export function ErrorState({
  title = 'Ocurrió un error',
  description,
  action,
  error,
}: ErrorStateProps) {
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : undefined;

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-danger/20 bg-danger/5 px-6 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {(description ?? detail) && (
          <p className="mt-1 text-sm text-muted-foreground">{description ?? detail}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}
