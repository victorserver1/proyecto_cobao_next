'use server'
// app/actions/image.ts
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const extension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${extension}`
    const filePath = path.join(process.cwd(), "public", "uploads", fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.promises.writeFile(filePath, buffer)

    uploadedUrls.push(`/uploads/${fileName}`)
  }

  return uploadedUrls
}
