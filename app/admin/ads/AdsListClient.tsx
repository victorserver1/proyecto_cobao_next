// app/admin/ads/AdsListClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Archive, ArchiveRestore, RadioTower, Trash2, Play, Pause, Loader2, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import UploadAds from "./Upload";

type AdStatus = "READY" | "ARCHIVED" | "DRAFT" | "PROCESSING" | "FAILED";

type Item = {
  id: number;
  title: string;
  url: string;
  status: AdStatus;
  createdAt: string | Date;
  filePath?: string | null;
  duration?: number | null;
};

export default function AdsListClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [nowPlayingId, setNowPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sorted = useMemo(
    () => items.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  const play = (item: Item) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => setNowPlayingId(null));
    }
    if (nowPlayingId === item.id) {
      audioRef.current.pause();
      setNowPlayingId(null);
      return;
    }
    audioRef.current.src = item.url;
    audioRef.current.play();
    setNowPlayingId(item.id);
  };

  const archive = (id: number, next: "ARCHIVED" | "READY") => {
    startTransition(async () => {
      const prev = items;
      setItems(prev.map(it => (it.id === id ? { ...it, status: next } : it)));
      const res = await fetch(`/api/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setItems(prev);
        alert("No se pudo actualizar el estado");
      }
    });
  };

  const transmit = (id: number) => {
    startTransition(async () => {
      const res = await fetch(`/api/ads/${id}/transmit`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.message || "No se pudo iniciar la transmisión");
        return;
      }
      alert("📡 Transmisión iniciada");
    });
  };

  const remove = (id: number) => {
    if (!confirm("¿Eliminar este anuncio? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const prev = items;
      setItems(prev.filter(it => it.id !== id));
      const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setItems(prev);
        const data = await res.json().catch(() => ({}));
        alert(data?.message || "No se pudo eliminar");
      }
      if (nowPlayingId === id && audioRef.current) {
        audioRef.current.pause();
        setNowPlayingId(null);
      }
    });
  };

  const refresh = () => router.refresh();

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Uploader */}
      <div className="p-4 border-b">
        <UploadAds reset={refresh} />
      </div>

      {/* Now playing */}
      {nowPlayingId && (
        <div className="px-4 pt-3 text-xs sm:text-sm text-gray-600 flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          Reproduciendo anuncio:{" "}
          <span className="font-medium truncate">
            {items.find(x => x.id === nowPlayingId)?.title ?? "—"}
          </span>
        </div>
      )}

      {/* Vacío */}
      {sorted.length === 0 && (
        <div className="p-6 text-sm text-gray-500">Aún no hay anuncios. Sube algunos arriba.</div>
      )}

      {/* Lista responsiva */}
      <ul className="p-2 sm:p-4 space-y-2">
        {sorted.map((it) => (
          <li
            key={it.id}
            className="
              rounded-md border p-3 sm:p-4
              hover:bg-gray-50 transition-colors
              flex flex-col gap-3
              sm:flex-row sm:items-center
            "
          >
            {/* Izquierda: título + chips + url */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="truncate font-medium text-sm sm:text-base">{it.title}</span>
                {it.duration != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                    {Math.round(it.duration)}s
                  </span>
                )}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    it.status === "READY"
                      ? "text-green-700 border-green-200 bg-green-50"
                      : it.status === "ARCHIVED"
                      ? "text-gray-600 border-gray-200 bg-gray-50"
                      : it.status === "FAILED"
                      ? "text-red-700 border-red-200 bg-red-50"
                      : "text-amber-700 border-amber-200 bg-amber-50"
                  }`}
                  title={`Estado: ${it.status}`}
                >
                  {it.status}
                </span>
                {nowPlayingId === it.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                    Reproduciendo
                  </span>
                )}
              </div>

              <div className="text-[11px] sm:text-xs text-gray-500 break-all line-clamp-2 sm:line-clamp-1">
                {it.url}
              </div>
            </div>

            {/* Derecha: acciones */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => play(it)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-gray-100"
                title={nowPlayingId === it.id ? "Pausar" : "Reproducir"}
                aria-label={nowPlayingId === it.id ? "Pausar" : "Reproducir"}
              >
                {nowPlayingId === it.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {nowPlayingId === it.id ? "Pausar" : "Reproducir"}
                </span>
              </button>

              {it.status === "ARCHIVED" ? (
                <button
                  onClick={() => archive(it.id, "READY")}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50"
                  disabled={isPending}
                  title="Desarchivar"
                  aria-label="Desarchivar"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : "Desarchivar"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => archive(it.id, "ARCHIVED")}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50"
                  disabled={isPending}
                  title="Archivar"
                  aria-label="Archivar"
                >
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : "Archivar"}
                  </span>
                </button>
              )}

              <button
                onClick={() => transmit(it.id)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50"
                disabled={isPending}
                title="Transmitir"
                aria-label="Transmitir"
              >
                <RadioTower className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : "Transmitir"}
                </span>
              </button>

              <button
                onClick={() => remove(it.id)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-xs sm:text-sm hover:bg-red-50 border-red-200 text-red-700 disabled:opacity-50"
                disabled={isPending}
                title="Eliminar"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : "Eliminar"}
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}