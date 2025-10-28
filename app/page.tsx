import { getAllPosts } from "@/app/actions/post"
import NewsClient from "./NewsClient"



export default async function NewsPage() {
  const posts = await getAllPosts({ skip: 0 })
  return <NewsClient initialPosts={posts} />
}
