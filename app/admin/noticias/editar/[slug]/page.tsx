// app/admin/edit/[slug]/page.tsx
import { getPostById, getPostBySlug } from "@/app/actions/post"
import EditPostPage from "./EditPostPage"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


interface Props {
  params: { slug: string }
}

export default async function EditPost({ params }: Props) {
  const { slug } =  await params
  const isNew = slug === "new"
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || '';

  // Si el post existe, lo obtenemos desde el servidor
  const post = isNew ? null : await getPostBySlug(slug)

  

  return <EditPostPage post={post} isNew={isNew} userId={userId} />
}
