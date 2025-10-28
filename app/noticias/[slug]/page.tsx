import { getPostById, getPostBySlug } from "@/app/actions/post"
import { notFound } from "next/navigation"

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PostPageProps) {
  const slug =  params.slug
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "Publicación no encontrada",
    }
  }

  const image_url = post.images && post.images.length > 0 ? post.images[0] : null;
  const image_url_full = image_url ? new URL(image_url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').toString() : null;

  return {
    title: post.title,
    description: post.content.slice(0, 160).replace(/<[^>]+>/g, ""),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160).replace(/<[^>]+>/g, ""),
      images: image_url_full ? [image_url_full] : undefined,
    },
    twitter: {
      title: post.title,
      description: post.content.slice(0, 160).replace(/<[^>]+>/g, ""),
      images: image_url_full ? [image_url_full] : undefined,
    },

  }
}

export default async function PostPage({ params }: PostPageProps) {
  const slug =  params.slug
  const post = await getPostBySlug(slug)
  

  if (!post) {
    return notFound()
  }



  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Imagen principal */}
      {post.images && post.images.length > 0 && (
        <img
          src={post.images[0]}
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}

      {/* Título */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {/* Categoría y fecha */}
      <div className="flex items-center gap-4 text-gray-500 mb-6">
       
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      {/* autor */}
      <div className="flex items-center gap-4 text-gray-500 mb-6">
        <span>Por {post.author.name}</span>
      </div>

      {/* Contenido */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  )
}
