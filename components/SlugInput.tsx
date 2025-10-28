'use client'

import { useEffect, useMemo, useState } from 'react'

import { isSlugAvailable } from '@/app/actions/post' // Server Action
import { slugify } from '@/lib/Slugify'

type Props = {
  /** Texto base para generar el slug (por ejemplo el título) */
  source?: string
  /** Valor inicial del slug */
  defaultSlug?: string
  /** Llamado cuando cambia el slug válido (string) */
  onChange?: (slug: string) => void
  /** Permitir edición manual del slug (por defecto true) */
  editable?: boolean

  disabled?: boolean
}

export default function SlugInput({
  source = '',
  defaultSlug = '',
  onChange,
  editable = true,
  disabled = false,
}: Props) {
  const autoSlug = useMemo(() => slugify(source), [source])
  const [slug, setSlug] = useState(defaultSlug || autoSlug)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  // Si cambia el source (título) y no hay defaultSlug manual, actualiza
  useEffect(() => {
    if (!defaultSlug) setSlug(autoSlug)
  }, [autoSlug, defaultSlug])

  // Verificación con debounce
  useEffect(() => {
    if (!slug) { setAvailable(null); return }
    setChecking(true)
    const t = setTimeout(async () => {
      try {
        const ok = await isSlugAvailable(slug)
        setAvailable(ok)
        onChange?.(slug)
      } finally {
        setChecking(false)
      }
    }, 300) // debounce 300ms
    return () => clearTimeout(t)
  }, [slug, onChange])

  const hint =
    available === null
      ? 'Escribe un slug'
      : checking
      ? 'Verificando...'
      : available
      ? 'Disponible ✓'
      : 'Ya está en uso ✕'

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-red-200/80">
        Slug
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={slug}
          disabled = {disabled}
          onChange={(e) =>
            setSlug(editable ? slugify(e.target.value) : slug)
          }
          readOnly={!editable}
          placeholder="mi-post-genial"
          className="
            w-full rounded-md border border-red-700/40 bg-red-950/40
            px-3 py-2 text-red-100 placeholder-red-300/40
            focus:outline-none focus:ring-2 focus:ring-red-600/60
          "
        />
        <span
          className={
            "text-xs px-2 py-1 rounded " +
            (available === null
              ? "bg-zinc-800 text-red-200/70"
              : checking
              ? "bg-amber-900/40 text-amber-200"
              : available
              ? "bg-green-900/40 text-green-200"
              : "bg-red-900/40 text-red-200")
          }
        >
          {hint}
        </span>
      </div>
      <p className="text-xs text-red-300/60">
        URL final: <span className="text-red-200">/noticias/{slug || '...'}</span>
      </p>
    </div>
  )
}
