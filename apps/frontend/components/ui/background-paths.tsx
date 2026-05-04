'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Disc3 } from 'lucide-react';
import { ThemeSegment } from '@/components/ui/theme-segment';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
    duration: 20 + (i % 5) * 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-[#00E676]"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}


export function BackgroundPaths({
  title = 'Background Paths',
}: {
  title?: string;
}) {
  const words = title.split(' ');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? theme === 'dark' : false;
  const brandColor = isDark ? '#00E676' : '#F97316';

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#08111F]">

      {/* Navbar top-right */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end gap-4 px-6 py-5">
        <Link
          href="/login"
          style={{ color: brandColor }}
          className="text-sm font-medium transition-colors duration-150"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/registro"
          style={{ borderColor: brandColor, color: isDark ? '#ffffff' : '#171717' }}
          className="rounded-full border-2 px-5 py-1.5 text-sm font-semibold transition-colors duration-150"
        >
          Registrarte
        </Link>
      </nav>

      {/* Theme toggle bottom-left — fixed so persists while scrolling */}
      <div className="fixed bottom-6 left-6 z-50">
        <ThemeSegment />
      </div>

      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="flex items-center justify-center gap-6 text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            <Disc3 className="shrink-0 h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 text-[#F97316] dark:text-[#00E676]" />
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split('').map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: 'spring',
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

        </motion.div>
      </div>
    </div>
  );
}
