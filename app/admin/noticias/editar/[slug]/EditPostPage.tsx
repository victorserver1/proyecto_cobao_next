// app/admin/edit/[slug]/EditPostPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Editor from "./Editor";
import {
  changePostStatus,
  updatePost,
} from "@/app/actions/post";
import ImageUploader from "@/app/components/ImageUploader";
import SlugInput from "@/components/SlugInput";
import { toast } from "sonner";
import { Post } from "@prisma/client";

export default function EditPostPage({
  post,
  isNew,
  userId,
}: {
  post: Post | null;
  isNew: boolean;
  userId: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setPreviewUrls] = useState<string[]>(post?.images || []);
  const [id, setId] = useState(post?.id || null);
  const [slug, setSlug] = useState("");
  console.log("Post images:", post?.images);

  const handleSave = async () => {
    setLoading(true);

    try {
      const result = await updatePost({
        id: isNew ? undefined : post?.id,
        title,
        content,

        images,
        slug,
        userId,
        isReady,
      });
      setId(result.id);
      setIsReady(true);
      toast.success("Publicación guardada con éxito");
    } catch (err) {
      console.error(err);
      toast.error(`Error al guardar la publicación`, {
        description: String(err),
      });
    }
    setLoading(false);
  };

  //  si algun input cambia, desabilitar publicar
  useEffect(() => {
    setIsReady(false);
  }, [title, content, images, slug]);

  const handlePublish = async () => {
    if (!id) {
      toast.error("Guarda la publicación antes de publicarla");
      return;
    }

    setLoading(true);
    try {
      await changePostStatus(id, true);
      setLoading(false);
      toast.success("Publicación exitosa");
    } catch (error) {
      setLoading(false);
      toast.error(`Error al publicar }`);
    }

    router.push("/admin/noticias");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {isNew ? "Nueva publicación" : "Editar publicación"}
        </h1>
        {/* mostrar si esta publicado o no */}
        <p>{published ? "Publicado" : "Borrador"}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/noticias")}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Guardar
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading || id === null || !isReady}
          >
            Publicar
          </Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Título de la publicación"
        className="w-full p-2 border rounded-lg mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <SlugInput
        source={title}
        defaultSlug={post?.slug || ""}
        onChange={(newSlug) => setSlug(newSlug)}
        disabled={id ? true : false}
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium">Imágenes:</label>
        <ImageUploader
          onUploadComplete={(urls) => {
            console.log(urls);
            setPreviewUrls((prev) => [...prev, ...urls]);
            console.log("Updated images:", [...images, ...urls]);
          }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Imagen ${index}`}
                className="h-44 w-44 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <Editor content={content} onChange={setContent} />

      <label className="flex items-center gap-2 mt-4">
        <span>Borrador / Publicado:</span>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-5 h-5"
        />
      </label>
    </div>
  );
}
