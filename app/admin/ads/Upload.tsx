// app/music/manage/Upload.tsx
'use client';

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

type ItemResult =
  | { ok: true; index: number; title: string; url: string; id: number }
  | { ok: false; index: number; error: string; filename?: string };

type FileItem = { file: File; name: string };

export default function UploadAds({ reset }: { reset: () => void }) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [userId, setUserId] = useState("no-user");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ItemResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const onPick = (fl: FileList | null) => {
    setError(null);
    setResults(null);
    if (!fl?.length) { setItems([]); return; }

    const arr = Array.from(fl);
    const onlyMp3 = arr.filter(f => f.type === "audio/mpeg");
    if (!onlyMp3.length) {
      setError("Selecciona archivos MP3 (audio/mpeg).");
      setItems([]);
      return;
    }
    if (onlyMp3.length !== arr.length) {
      setError("Se ignoraron archivos que no son MP3.");
    }

    const mapped: FileItem[] = onlyMp3.map(f => ({
      file: f,
      name: f.name.replace(/\.[^.]+$/, ""),
    }));

    setItems(mapped);
  };

  const updateName = (idx: number, name: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, name } : it));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async () => {
    try {
      setError(null);
      setResults(null);
      if (!items.length) { setError("Selecciona al menos un MP3."); return; }
      if (items.some(it => !it.name.trim())) {
        setError("Todos los archivos deben tener un nombre.");
        return;
      }

      const fd = new FormData();
      fd.append("userId", userId);
      for (const it of items) {
        fd.append("files", it.file);
        fd.append("names[]", it.name.trim());
      }

      setLoading(true);
      const res = await fetch("/api/ads", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo subir");

      setResults(data?.results || []);
      setItems([]);     // limpia selección
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) input.value = ""; // limpia el input file
    
      reset();          // 🔁 recarga lista en el padre (router.refresh)
    } catch (e: any) {
      setError(e?.message || "Error al subir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-medium">Subir múltiples MP3</h2>
      <p className="text-sm text-gray-500">Selecciona varios <strong>.mp3</strong>, renómbralos y súbelos.</p>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Archivos MP3</label>
        <input
          type="file"
          accept="audio/mpeg"
          multiple
          onChange={(e) => onPick(e.target.files)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {!!items.length && (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-md border">
              <div className="flex-1 w-full">
                <div className="text-xs text-gray-500 mb-1">
                  {it.file.name} — {Math.round(it.file.size / 1024)} KB
                </div>
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  placeholder="Nombre sin extensión"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                title="Quitar"
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.map((r, i) =>
            r.ok ? (
              <div key={i} className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <p>✅ {r.title} — <span className="font-mono">{r.url}</span></p>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>❌ {r.filename ?? `Archivo #${r.index+1}`} — {r.error}</p>
              </div>
            )
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={!items.length || loading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm ${
            !items.length || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Upload className="h-4 w-4" />
          {loading ? "Subiendo..." : "Subir todo"}
        </button>
      </div>
    </section>
  );
}