// app/actions/post.ts
"use server"

import { prisma } from "@/lib/prisma"
// app/actions/post.ts

import { z } from "zod"
interface UpdatePostInput {
  id?: number
  title: string
  content: string
  images?: string[],
  slug: string,
  userId: string,
  isReady: boolean,
}



export async function getPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },

  })
}


export async function getAllPosts({
  skip,

}: {
  skip?: number
 
}) {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    skip: 0 || skip,
    take: 8,
   
  })
}

export async function getAllPostsAdmin(userId = '') {
  const posts = await prisma.post.findMany({
    where: {
      author: {
        id: userId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
    },
  })
  return posts
}

export async function deletePost(id: number) {
  return prisma.post.delete({ where: { id } })
}

export async function changePostStatus(id: number, published: boolean) {
  return prisma.post.update({
    where: { id },
    data: { published },
  })
}

const PostSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "El título es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio"),
  images: z.array(z.string()).min(1, "Al menos una imagen es obligatoria").optional(),
  slug: z.string().min(1, "El slug es obligatorio"),
  userId: z.string().min(1, "El userId es obligatorio"),
  isReady: z.boolean(),
})

type PostInput = z.infer<typeof PostSchema>
export async function updatePost(data: UpdatePostInput) {
  

  const validation = PostSchema.safeParse(data)
  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => issue.message).join(", ")
    return Promise.reject( errors)
  }
  const { id, title, content, images = [], slug, userId } = data

  if (id) {
    try{
    // 🟢 Actualiza un post existente
    return prisma.post.update({
      where: { id },
      data: {
        title,
        content,

        images, // <-- asegúrate de incluir esto
      },
    })
    } catch(err: Error | any){
      return Promise.reject("Error updating post: " + err.message);
    }
    
  } else {


    try{
return prisma.post.create({
      data: {
        title,
        content,
        images, // <-- y también aquí
        slug,
        userId
      },
    })
    } catch(err: Error | any){
      return Promise.reject("Error creating post: " + err.message);
    }
    // 🟢 Crea un nuevo post
    
  }
}

export async function isSlugAvailable(slug: string) {
  if (!slug) return false
  if(slug === "new") return false
  // 
  const existing = await prisma.post.findUnique({ where: { slug } })
  return !existing
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true
    }

  })
}



export async function getNextPostSlug(
  currentSlug: string,

) {
  'use server' // 👈 MUY importante

  const post = await prisma.post.findUnique({
    where: { slug: currentSlug },
    select: { id: true},
  })

  if (!post) return null

  const nextPost = await prisma.post.findFirst({
    where: {
      id: { gt: post.id },
    },
    orderBy: { id: "asc" },
    select: { slug: true },
  })

  return nextPost ? nextPost.slug : null

}

export async function toogleIsReadyPost(id: number, isReady: boolean) {
  try {
  return prisma.post.update({
    where: { id },
    data: { isReady },
  })
  } catch (err: Error | any) {
    return Promise.reject("Error updating isReady status: " + err.message);
  }
}