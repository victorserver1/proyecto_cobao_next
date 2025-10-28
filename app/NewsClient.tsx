'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/app/actions/post'

export default function NewsClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [skip, setSkip] = useState(initialPosts.length)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  async function fetchMore() {
    setLoading(true)
    const newPosts = await getAllPosts({ skip }) // 🔥 llamada directa
    if (newPosts.length === 0) {
      setHasMore(false)
    } else {
      setPosts((prev) => [...prev, ...newPosts])
      setSkip((prev) => prev + newPosts.length)
    }
    setLoading(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMore()
      }
    })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  return (
    <section className="text-white">
      <div className=" mx-auto px-5 py-0 mb-20">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-red-900 drop-shadow-[0_0_8px_#ffb4a2] mb-10">
          APUNTES
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {posts.map((post) => (
            <Link key={post.id} href={`/noticias/${post.slug}`} className="group">
              <article className="
                relative overflow-hidden rounded-2xl
                border-2 border-red-500/50 ring-1 ring-red-700/50
                bg-gradient-to-b from-red-800 to-red-950
                shadow-[0_0_25px_rgba(255,80,80,0.3)]
                hover:shadow-[0_0_45px_rgba(255,100,100,0.5)]
                transition-all duration-300">
                {post.images?.[0] ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-48 w-full bg-red-900/50 flex items-center justify-center text-red-200/70 tracking-widest uppercase text-xs">
                    Sin imagen
                  </div>
                )}
                <div className="p-4">
                  <h2
  className="
    text-lg font-bold text-red-100
    drop-shadow-[0_0_6px_#ffb4a2]
    transition-colors group-hover:text-red-200
    truncate
  "
  title={post.title} // 👈 muestra el título completo al pasar el mouse
>
  {post.title}
</h2>

                </div>
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500/50 blur-[1px] shadow-[0_0_12px_#ff4d4d]" />
              </article>
            </Link>
          ))}
        </div>

        <div className="flex justify-center items-center mt-10">
          {loading && <p className="text-red-300/80">Cargando más...</p>}
          {!hasMore && <p className="text-red-400/60 text-xs">No hay más publicaciones</p>}
        </div>
        <div ref={sentinelRef} className="h-6" />
      </div>
    </section>
  )
}
