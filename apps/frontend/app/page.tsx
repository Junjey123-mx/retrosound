import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">RetroSound Store</h1>
      <p className="text-muted-foreground">Vinilos · CDs · Casetes</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
        >
          Registrarse
        </Link>
      </div>
    </main>
  );
}
