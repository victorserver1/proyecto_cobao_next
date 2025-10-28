// app/api/uploadImage/route.ts
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const files = formData.getAll("file") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${ext}`
      const filePath = path.join(uploadDir, fileName)
      fs.writeFileSync(filePath, buffer)
      urls.push(`/uploads/${fileName}`)
    }

    return NextResponse.json({ urls })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Error uploading files" }, { status: 500 })
  }
}
