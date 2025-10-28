'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Footer() {
  const { data: session, status } = useSession()

  return (
    <footer
      className="fixed bottom-0 left-0 w-full h-14
                 bg-red-900 border-t border-red-800/60 text-red-200 text-sm
                 flex items-center justify-center gap-3 px-4
                 shadow-[0_-2px_15px_rgba(255,80,80,0.2)] z-50 flex-wrap"
      role="contentinfo"
      aria-label="Información del sitio"
    >
      <p className="tracking-wide text-red-300/80">
        © {new Date().getFullYear()} Aprende al Aire
      </p>
      <span className="hidden sm:inline text-red-300/40">•</span>
      <p className="tracking-wide text-red-300/80">Desarrollado por Amaury Diaz</p>

      <button
        onClick={() => (session ? signOut() : signIn('google'))}
        className="ml-2 text-red-400 hover:text-red-100 underline transition"
        aria-label={session ? 'Cerrar sesión' : 'Iniciar sesión con Google'}
      >
        {status === 'authenticated' ? 'Cerrar sesión' : 'Iniciar sesión'}
      </button>
      {/* go to /admin */}
      <Link
        href="/admin"
        className="ml-2 text-red-400 hover:text-red-100 underline transition"
        aria-label="Ir a la administración"
        hidden={!session}
      >
        Ir a la administración
      </Link>
    </footer>
  )
}
