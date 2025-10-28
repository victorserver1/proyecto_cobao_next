'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, notFound } from 'next/navigation';
import { ChevronLeft, Home, ChevronRight, HomeIcon } from 'lucide-react'
import { getNextPostSlug } from '@/app/actions/post' // 👈 importa directo
import { get } from 'http'

export default function NavControls() {
  const router = useRouter()
  const pathname = usePathname()

  const [notFoundNext, setNotFoundNext] = useState(false)

// detectar si hay una siguiente noticia
  const checkNextPost = async () => {
    console.log(pathname)
    if(pathname.includes('/noticias/')){
      const currentslug = pathname.split('/')
      const slug = currentslug[currentslug.length -1]
      const nextSlug2 = await getNextPostSlug(slug)

      if (!nextSlug2) {
        setNotFoundNext(true)
      }
    }
  }

  const goNext = async() => {
 
    const currentslug = pathname.split('/')
    const slug = currentslug[currentslug.length -1]
    const nextSlug2 = await getNextPostSlug(slug)

    if (nextSlug2) {
      router.push(`/noticias/${nextSlug2}`)
    }
  }

  const goHome = () => {
    router.push('/')
  }

  const goBack = () => {
    router.back()
  }

  // ... tu UI existente (botones atrás/home/siguiente)
  return (
   <nav
  className="w-full bg-white border-b border-red-800/60 backdrop-blur-sm
             text-red-100 flex items-center justify-center px-4  cursor-pointer"
  aria-label="Navegación secundaria"
>
  <div className="max-w-7xl w-full py-2 flex items-center justify-center">
    <div
      className="
        relative inline-flex overflow-hidden rounded-2xl
        border border-red-700/60 bg-gradient-to-b from-red-900/70 to-red-950/70
        shadow-[0_8px_24px_rgba(255,80,80,0.12),inset_0_0_0_1px_rgba(255,255,255,0.03)]
      "
      role="tablist"
    >
      {/* Brillo inferior tipo neon */}
      <span className="pointer-events-none absolute inset-x-10 -bottom-3 h-6 blur-2xl bg-red-600/30" />

      {/* === ATRÁS === */}
      <button
        onClick={goBack}
        role="tab"
        aria-label="Volver"
        title="Volver"
        
     
        className={[
          "group relative flex items-center gap-2 px-5 h-12",
          "font-semibold uppercase text-xs tracking-[0.12em]",
          "bg-gradient-to-b from-red-800/60 to-red-950/60",
          "text-red-200 hover:text-red-100",
          "border-r border-red-700/50",
          "transition-all",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "rounded-l-2xl",
          "cursor-pointer"
        ].join(" ")}
      >
        <ChevronLeft className="h-5 w-5 drop-shadow-[0_0_6px_#ff8c8c]" />
        <span className="hidden sm:inline">Atrás</span>

        {/* underline hover */}
        <span className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-center transition-transform bg-red-400/70" />
      </button>

      {/* === HOME === */}
      <button
        onClick={goHome}
        role="tab"
        aria-label="Inicio"
        title="Inicio"
        className={[
          "group relative flex items-center gap-2 px-6 h-12",
          "font-extrabold uppercase text-xs tracking-[0.16em]",
          "bg-gradient-to-b from-red-800 to-red-950",
          "text-red-100 hover:text-white",
          "shadow-[0_0_18px_rgba(255,90,90,0.22)]",
          "transition-all",
          "border-r border-red-700/50",
            "cursor-pointer"
        ].join(" ")}
      >
        <Home className="h-5 w-5 drop-shadow-[0_0_7px_#ffb4a2]" />
        <span className="hidden sm:inline">Inicio</span>

        {/* halo sutil */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-transparent to-red-500/5" />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-center transition-transform bg-red-400/80" />
      </button>

      {/* === SIGUIENTE === */}
      <button
        onClick={goNext}
        role="tab"
        aria-label="Siguiente"
        disabled={notFoundNext}
        title={ "Siguiente noticia"}
     
        className={[
          "group relative flex items-center gap-2 px-5 h-12",
          "font-semibold uppercase text-xs tracking-[0.12em]",
          "bg-gradient-to-b from-red-800/60 to-red-950/60",
          "text-red-200 hover:text-red-100",
          "transition-all",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "rounded-r-2xl",
            "cursor-pointer"
        ].join(" ")}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-5 w-5 drop-shadow-[0_0_6px_#ff8c8c]" />

        <span className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-center transition-transform bg-red-400/70" />
      </button>
    </div>
  </div>
</nav>
  )
}