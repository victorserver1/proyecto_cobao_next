"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { deletePost, changePostStatus } from "../../actions/post";
import { Post, User } from "@prisma/client";
import { Calendar, PenSquare, Trash2, UserRound } from "lucide-react";

interface AdminTableProps {
  posts: (Post & { author: User | null })[];
}

export default function AdminTable({ posts }: AdminTableProps) {
  const router = useRouter();

  const handleEdit = (slug?: string | null) => {
    if (!slug) return;
    router.push(`/admin/noticias/editar/${slug}`);
  };
  const handleCreate = () => router.push(`/admin/noticias/editar/new`);
  const handleDelete = async (id: number) => {
    await deletePost(id);
    router.refresh();
  };
  const toggleStatus = async (id: number, published: boolean) => {
    await changePostStatus(id, !published);
    router.refresh();
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate} className="rounded-full">
          + Nueva publicación
        </Button>
      </div>

      {/* ====== MOBILE MODERNO: tarjetas (sm-) ====== */}
      <ul className="grid gap-3 sm:hidden">
        {posts.map((post) => {
          const published = post.published;
          return (
            <li
              key={post.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-white p-3 shadow-sm",
                "border-gray-200",
                "transition active:scale-[0.99]"
              )}
            >
              {/* Fondo decorativo sutil */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-red-500/10 to-red-900/10 blur-2xl"
              />

              {/* Header: autor + estado */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {post.author?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author.image}
                      alt={post.author.name ?? "Autor"}
                      className="h-10 w-10 rounded-full ring-2 ring-red-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 ring-2 ring-red-100">
                      <UserRound className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {post.author?.name ?? "Autor"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="truncate">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Chip estado + switch */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                      published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {published ? "Publicado" : "Borrador"}
                  </span>
                  <Switch
                    checked={published}
                    onCheckedChange={() => toggleStatus(post.id, published)}
                    aria-label="Cambiar estado"
                  />
                </div>
              </div>

              {/* Título */}
              <button
                onClick={() => handleEdit(post.slug)}
                className="mt-3 block text-left"
                title="Editar publicación"
              >
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
                  {post.title}
                </h3>
              </button>

              {/* Acciones flotantes */}
              <div className="mt-3 flex items-center justify-between">
                {/* Slug / ID hint */}
                <span className="truncate text-[11px] text-gray-500">
                  {post.slug ? `/${post.slug}` : `#${post.id}`}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full"
                    onClick={() => handleEdit(post.slug)}
                    title="Editar"
                  >
                    <PenSquare className="h-4.5 w-4.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9 rounded-full"
                    onClick={() => handleDelete(post.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ====== DESKTOP: tabla limpia (sm+) ====== */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="p-3 text-left">Título</th>
                <th className="p-3 text-left">Autor</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center whitespace-nowrap">Fecha</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className={cn(
                    "border-t transition-colors hover:bg-gray-50",
                    !post.published && "opacity-90"
                  )}
                >
                  <td className="max-w-[420px] p-3 font-medium">
                    <div className="line-clamp-1">{post.title}</div>
                    <div className="mt-1 text-[11px] text-gray-500">
                      {post.slug ? `/${post.slug}` : `#${post.id}`}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {post.author?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.author.image}
                          alt={post.author.name ?? "Autor"}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                          <UserRound className="h-4.5 w-4.5" />
                        </div>
                      )}
                      <span>{post.author?.name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={post.published}
                        onCheckedChange={() =>
                          toggleStatus(post.id, post.published)
                        }
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          post.published ? "text-green-600" : "text-gray-500"
                        )}
                      >
                        {post.published ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center text-gray-700 whitespace-nowrap">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post.slug)}
                        className="rounded-full"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="rounded-full"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}