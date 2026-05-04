'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { Disc3, Music, Music2, Music4, Radio, ShoppingBag, Star, Clock, Award } from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const d = mounted ? theme === 'dark' : false;

  /* ── Tokens por modo ─────────────────────────────────────────────── */
  const sectionBgA    = d ? '#08111F' : '#F6F8FB';   // Colecciones + Sobre
  const sectionBgB    = d ? '#031A0E' : '#F5A245';   // Qué ofrecemos
  const sectionTitle  = d ? '#F8FAFC' : '#0F172A';
  const sectionDesc   = d ? '#94A3B8' : '#475569';
  const brandLink     = d ? '#00E676' : '#F97316';
  const brandLinkHov  = d ? '#00C853' : '#EA580C';
  const ringColor     = d ? '#0D3A1C' : '#F97316';

  const colCard       = { bg: d ? '#0F172A' : '#FFFFFF',  border: d ? 'rgba(255,255,255,0.06)' : '#E8EDF4' };
  const colIconBorder = d ? 'rgba(0,230,118,0.30)' : 'rgba(249,115,22,0.30)';
  const colIconBg     = d ? 'rgba(0,230,118,0.08)' : 'rgba(249,115,22,0.08)';


  const SERVICES = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: 'Catálogo curado',
      desc: 'Selección editorial de vinilos, CDs y casetes de múltiples géneros y décadas.',
      cardBg:    d ? '#071C10' : '#B8CAFF',
      iconBg:    d ? '#0F2D1C' : '#A0B4FF',
      iconColor: d ? '#00E676' : '#3B82F6',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Condición garantizada',
      desc: 'Cada producto revisado y clasificado antes de llegar a tu colección.',
      cardBg:    d ? '#1A0E04' : '#FFD4A0',
      iconBg:    d ? '#2A1A08' : '#FFC07A',
      iconColor: d ? '#F59E0B' : '#F97316',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Stock actualizado',
      desc: 'Inventario en tiempo real. Si está en el catálogo, está disponible.',
      cardBg:    d ? '#071C10' : '#AADCC0',
      iconBg:    d ? '#0F2D1C' : '#8CCBA8',
      iconColor: d ? '#00E676' : '#16A34A',
    },
  ];

  const STATS = [
    {
      icon: <Award className="h-6 w-6" />, num: '500+', label: 'Productos en catálogo',
      cardBg:    d ? '#060D18' : '#E8EEFF',
      iconBg:    d ? '#0A2E22' : '#D0D9FF',
      iconColor: d ? '#00E676' : '#3B82F6',
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />, num: '200+', label: 'Ventas completadas',
      cardBg:    d ? '#060D18' : '#FFF4E6',
      iconBg:    d ? '#0C3024' : '#FFE0B2',
      iconColor: d ? '#00E676' : '#F97316',
    },
    {
      icon: <Clock className="h-6 w-6" />, num: '3', label: 'Formatos físicos',
      cardBg:    d ? '#060D18' : '#E8F5EE',
      iconBg:    d ? '#0A2E22' : '#C6E6D4',
      iconColor: d ? '#00E676' : '#16A34A',
    },
  ];

  return (
    <main className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <BackgroundPaths title="RetroSound" />

      {/* ── COLECCIONES ──────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: sectionBgA }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: brandLink }}>
            Formatos disponibles
          </p>
          <h2 className="mb-14 text-4xl font-bold tracking-tight md:text-5xl" style={{ color: sectionTitle }}>
            Colecciones destacadas
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: <Disc3 className="h-8 w-8" style={{ color: brandLink }} />,  title: 'Vinilos',  desc: 'LP, EP y singles en 12″, 10″ y 7″. Presiones originales y reediciones.' },
              { icon: <Music2 className="h-8 w-8" style={{ color: brandLink }} />, title: 'CDs',      desc: 'Álbumes completos y ediciones especiales con libretos originales.' },
              { icon: <Radio  className="h-8 w-8" style={{ color: brandLink }} />, title: 'Casetes',  desc: 'La nostalgia del cassette. Mixtas, originales y grabaciones raras.' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-6 rounded-2xl p-8 shadow-sm transition-all duration-300"
                style={{ backgroundColor: colCard.bg, border: `1px solid ${colCard.border}` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `2px solid ${brandLink}`;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${d ? 'rgba(0,230,118,0.15)' : 'rgba(249,115,22,0.12)'}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = `1px solid ${colCard.border}`;
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2"
                  style={{ borderColor: colIconBorder, backgroundColor: colIconBg }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold" style={{ color: sectionTitle }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: sectionDesc }}>{item.desc}</p>
                </div>
                <a
                  href="/login"
                  className="mt-auto text-xs font-semibold tracking-widest uppercase transition-colors"
                  style={{ color: brandLink }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = brandLinkHov)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = brandLink)}
                >
                  Ver colección →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ OFRECEMOS ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-6" style={{ backgroundColor: sectionBgB }}>
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full border-32 opacity-30" style={{ borderColor: ringColor }} />
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full border-20 opacity-20" style={{ borderColor: ringColor }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-32 opacity-30" style={{ borderColor: ringColor }} />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full border-20 opacity-20" style={{ borderColor: ringColor }} />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] uppercase text-white">
            Servicios
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Qué ofrecemos
          </h2>
          <p className="mb-14 max-w-xl text-white/80">
            Más que una tienda — una experiencia completa para el amante de la música física.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-6 rounded-2xl p-8 shadow-sm"
                style={{
                  backgroundColor: item.cardBg,
                  border: d ? `1px solid ${item.iconColor}35` : 'none',
                  boxShadow: d ? `inset 0 0 0 1px ${item.iconColor}10` : undefined,
                }}
              >
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/75">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE RETROSOUND ─────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-6" style={{ backgroundColor: sectionBgA }}>
        {/* Decorative musical notes */}
        <Music  className="pointer-events-none absolute -top-4 right-10 h-44 w-44 -rotate-12" style={{ color: d ? '#00E676' : '#B0C4DE', opacity: d ? 0.18 : 0.35 }} />
        <Music4 className="pointer-events-none absolute top-10 right-52 h-24 w-24 rotate-6"   style={{ color: d ? '#00E676' : '#B0C4DE', opacity: d ? 0.12 : 0.25 }} />
        <Music2 className="pointer-events-none absolute -bottom-2 left-0 h-36 w-36 rotate-12" style={{ color: d ? '#00E676' : '#B0C4DE', opacity: d ? 0.18 : 0.35 }} />
        <Music  className="pointer-events-none absolute bottom-10 left-36 h-22 w-22 -rotate-6" style={{ color: d ? '#00E676' : '#B0C4DE', opacity: d ? 0.12 : 0.25 }} />
        <Music4 className="pointer-events-none absolute bottom-20 left-16 h-14 w-14 rotate-12"  style={{ color: d ? '#00E676' : '#B0C4DE', opacity: d ? 0.10 : 0.20 }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: brandLink }}>
                Nuestra historia
              </p>
              <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl" style={{ color: sectionTitle }}>
                Sobre RetroSound
              </h2>
              <p className="mb-4 leading-relaxed" style={{ color: sectionDesc }}>
                Somos una tienda especializada en música física, nacida del amor por el sonido
                analógico y la colección tangible. Creemos que la música suena mejor cuando la
                puedes sostener en tus manos.
              </p>
              <p className="leading-relaxed" style={{ color: sectionDesc }}>
                Nuestro catálogo abarca desde clásicos del jazz y rock hasta electrónica
                contemporánea, todos en los formatos que los artistas quisieron que los escucharas.
              </p>
              <div className="mt-8">
                <a
                  href="/registro"
                  className="inline-flex items-center gap-2 border-b-2 pb-1 text-sm font-semibold uppercase tracking-widest transition-colors"
                  style={{ color: brandLink, borderColor: brandLink }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = brandLinkHov; e.currentTarget.style.borderColor = brandLinkHov; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = brandLink;    e.currentTarget.style.borderColor = brandLink; }}
                >
                  Crear cuenta gratuita →
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-4 rounded-2xl p-6 text-center"
                  style={{
                    backgroundColor: stat.cardBg,
                    border: d ? '1.5px solid rgba(0,230,118,0.45)' : 'none',
                    boxShadow: d ? '0 0 18px rgba(0,230,118,0.08), inset 0 0 12px rgba(0,230,118,0.06)' : '0 1px 4px rgba(0,0,0,0.07)',
                  }}
                >
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: stat.iconBg,
                      color: stat.iconColor,
                      border: d ? '1.5px solid rgba(0,230,118,0.40)' : 'none',
                      boxShadow: d ? '0 0 10px rgba(0,230,118,0.20)' : 'none',
                    }}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-bold" style={{ color: sectionTitle }}>{stat.num}</span>
                  <span className="text-xs leading-snug" style={{ color: sectionDesc }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: d ? '#08111F' : '#F97316' }}>
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="mb-3 text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: d ? '#00E676' : 'rgba(255,255,255,0.80)' }}
          >
            Empieza hoy
          </p>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            ¿Listo para coleccionar?
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: d ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.75)' }}>
            Regístrate, explora el catálogo y lleva a casa la música que marcó tu vida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/registro"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-widest transition-colors duration-200"
              style={{
                backgroundColor: d ? '#00E676' : '#ffffff',
                color: d ? '#08111F' : '#F97316',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = d ? '#00C853' : 'rgba(255,255,255,0.90)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = d ? '#00E676' : '#ffffff'; }}
            >
              Crear cuenta →
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-widest transition-colors duration-200"
              style={{
                border: d ? '2px solid #00E676' : '2px solid #ffffff',
                color: '#ffffff',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = d ? 'rgba(0,230,118,0.10)' : 'rgba(255,255,255,0.10)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* left padding so the fixed ThemeSegment (~160px wide at left-6) doesn't overlap */}
          <span className="pl-44 font-semibold tracking-widest uppercase text-white">RetroSound Store</span>
          <span className="text-white">Vinilos · CDs · Casetes · Guatemala</span>
        </div>
      </footer>
    </main>
  );
}
