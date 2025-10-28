// app/components/ImageUploader.tsx
"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      acceptedFiles.forEach((file) => formData.append("file", file))

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir archivos")

      onUploadComplete(data.urls)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Error al subir imágenes")
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`p-4 border-2 border-dashed rounded-lg cursor-pointer text-center ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p className="text-blue-600">Subiendo imágenes...</p>
      ) : (
        <p className="text-gray-600">
          Arrastra tus imágenes aquí o haz clic para seleccionar
        </p>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
