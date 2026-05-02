import { BackgroundPaths } from '@/components/ui/background-paths';
import { Disc3, Music2, Radio, ShoppingBag, Star, Clock, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">

      {/* ── HERO — BackgroundPaths ────────────────────────────────── */}
      <BackgroundPaths title="RetroSound" />

      {/* ── COLECCIONES ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0F172A]">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#A67C52]">
            Formatos disponibles
          </p>
          <h2 className="mb-14 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Colecciones destacadas
          </h2>
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {[
              {
                icon: <Disc3 className="h-8 w-8 text-[#A67C52]" />,
                title: 'Vinilos',
                desc: 'LP, EP y singles en 12″, 10″ y 7″. Presiones originales y reediciones.',
              },
              {
                icon: <Music2 className="h-8 w-8 text-[#A67C52]" />,
                title: 'CDs',
                desc: 'Álbumes completos y ediciones especiales con libretos originales.',
              },
              {
                icon: <Radio className="h-8 w-8 text-[#A67C52]" />,
                title: 'Casetes',
                desc: 'La nostalgia del cassette. Mixtas, originales y grabaciones raras.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-6 bg-[#0F172A] p-10 hover:bg-[#1F2430] transition-colors duration-300"
              >
                {item.icon}
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
                </div>
                <a
                  href="/login"
                  className="mt-auto text-xs font-medium tracking-widest uppercase text-[#A67C52] hover:text-white transition-colors"
                >
                  Ver colección →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ OFRECEMOS ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#F5F3EE]">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#A67C52]">
            Servicios
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Qué ofrecemos
          </h2>
          <p className="mb-14 max-w-xl text-[#1F2430]/60">
            Más que una tienda — una experiencia completa para el amante de la música física.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShoppingBag className="h-6 w-6" />,
                title: 'Catálogo curado',
                desc: 'Selección editorial de vinilos, CDs y casetes de múltiples géneros y décadas.',
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: 'Condición garantizada',
                desc: 'Cada producto revisado y clasificado antes de llegar a tu colección.',
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: 'Stock actualizado',
                desc: 'Inventario en tiempo real. Si está en el catálogo, está disponible.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-[#0F172A]/10 bg-white p-8 hover:border-[#A67C52] transition-colors duration-300"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center bg-[#0F172A] text-white">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#1F2430]/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE RETROSOUND ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#7A5C42]/10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#A67C52]">
                Nuestra historia
              </p>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
                Sobre RetroSound
              </h2>
              <p className="mb-4 text-[#1F2430]/70 leading-relaxed">
                Somos una tienda especializada en música física, nacida del amor por el sonido
                analógico y la colección tangible. Creemos que la música suena mejor cuando la
                puedes sostener en tus manos.
              </p>
              <p className="text-[#1F2430]/70 leading-relaxed">
                Nuestro catálogo abarca desde clásicos del jazz y rock hasta electrónica
                contemporánea, todos en los formatos que los artistas quisieron que los escucharas.
              </p>
              <div className="mt-8">
                <a
                  href="/registro"
                  className="inline-flex items-center gap-2 border-b-2 border-[#A67C52] pb-1 text-sm font-semibold uppercase tracking-widest text-[#0F172A] hover:border-[#0F172A] transition-colors"
                >
                  Crear cuenta gratuita →
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Award className="h-6 w-6" />, num: '500+', label: 'Productos en catálogo' },
                { icon: <ShoppingBag className="h-6 w-6" />, num: '200+', label: 'Ventas completadas' },
                { icon: <Clock className="h-6 w-6" />, num: '3', label: 'Formatos físicos' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-3 bg-white p-6 text-center"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center bg-[#0F172A] text-white">
                    {stat.icon}
                  </div>
                  <span className="text-3xl font-bold text-[#0F172A]">{stat.num}</span>
                  <span className="text-xs text-[#1F2430]/60">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#0F172A]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#A67C52]">
            Empieza hoy
          </p>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl">
            ¿Listo para coleccionar?
          </h2>
          <p className="mb-10 text-white/50 leading-relaxed">
            Regístrate, explora el catálogo y lleva a casa la música que marcó tu vida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/registro"
              className="inline-flex items-center gap-2 bg-[#A67C52] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-[#7A5C42] transition-colors duration-300"
            >
              Crear cuenta →
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:border-white hover:bg-white/5 transition-colors duration-300"
            >
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#0F172A] py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span className="font-semibold tracking-widest uppercase text-white/50">RetroSound Store</span>
          <span>Vinilos · CDs · Casetes · Guatemala</span>
        </div>
      </footer>
    </main>
  );
}
