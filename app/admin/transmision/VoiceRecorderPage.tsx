"use client";
import { getAudioList } from "@/app/actions/audio";
import { Audio } from "@prisma/client";
import { Router } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";


// Archivo sugerido: app/voice-recorder/page.tsx
// Esta página graba audio con MediaRecorder y expone los botones:
// Iniciar, Pausar, Detener, Descartar, Guardar y Transmitir
  
export default function VoiceRecorder({ userId }: { userId: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0); // segundos
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("audio/webm");


  const router = useRouter();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMsg, setUploadMsg] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Comprobar soporte + elegir mimeType disponible
  useEffect(() => {
    const supported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    setIsSupported(supported);

    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ];
    for (const c of candidates) {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported?.(c)) {
        setMimeType(c);
        break;
      }
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRecording, isPaused]);

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    setPermissionError(null);
    setBlobUrl(null);
    setElapsed(0);
    setUploadStatus("idle");
    setUploadMsg("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        // Limpia el stream de micrófono
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mr.start(); // puedes usar mr.start(1000) si quieres chunks cada segundo
      setIsRecording(true);
      setIsPaused(false);
    } catch (err: any) {
      console.error(err);
      setPermissionError(err?.message ?? "No se pudo acceder al micrófono");
      setIsRecording(false);
      setIsPaused(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const pauseRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === "recording") {
      mr.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state === "paused") {
      mr.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    if (mr.state !== "inactive") mr.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const discard = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setElapsed(0);
    setUploadStatus("idle");
    setUploadMsg("");
    chunksRef.current = [];
  };

  const save = () => {
    // upload to server
    if (!blobUrl) return;
    const link = document.createElement("a");
  };

  const transmit = async () => {
const result = await Swal.fire({
  title: 'Nombre del podcast',
  input: 'text',
  inputLabel: 'Ingresa un nombre para el podcast',
  inputPlaceholder: 'Mi grabación',
  showCancelButton: true,
});
if (!result.isConfirmed) {
  return;
}

    const name = result.value || `grabacion-${Date.now()}`;




    if (!blobUrl) return;
    setUploadStatus("uploading");
    setUploadMsg("Subiendo audio...");
    try {
      const blob = await fetch(blobUrl).then((r) => r.blob());
      const form = new FormData();
      form.append("file", blob, `grabacion-${Date.now()}.${
        mimeType.includes("webm") ? "webm" : mimeType.includes("ogg") ? "ogg" : "m4a"
      }`);
      form.append("mimeType", mimeType);
      form.append("name", name || `grabacion-${Date.now()}`);
      form.append("userId", userId || '');
      

      const res = await fetch("/api/audio", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setUploadStatus("success");
      setUploadMsg(data?.message ?? "Audio subido correctamente");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setUploadStatus("error");
      setUploadMsg(e?.message ?? "No se pudo subir el audio");
    }
  };

  return (
    <div >
      <h1 className="text-2xl font-bold mb-2">Podcast Estudio</h1>
      <p className="text-sm text-gray-500 mb-6">
        Graba, pausa, detén, descarta, guarda y transmite.
      </p>

      {!isSupported && (
        <div className="rounded-lg border p-4 text-red-600">
          Tu navegador no soporta grabación de audio (MediaRecorder).
        </div>
      )}

      {permissionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 mb-4">
          {permissionError}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          <span className={`h-2 w-2 rounded-full ${isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
          {isRecording ? (isPaused ? "Pausado" : "Grabando") : "Listo"}
        </span>
        <span className="text-sm tabular-nums">{formatTime(elapsed)}</span>
        <span className="ml-auto text-xs text-gray-500">{mimeType}</span>
      </div>

      {/* Controles principales */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className="rounded-2xl px-4 py-2 bg-black text-white disabled:opacity-50"
          onClick={startRecording}
          disabled={isRecording}
        >
          Iniciar
        </button>

        <button
          className="rounded-2xl px-4 py-2 border disabled:opacity-50"
          onClick={pauseRecording}
          disabled={!isRecording || isPaused}
        >
          Pausar
        </button>

        <button
          className="rounded-2xl px-4 py-2 border disabled:opacity-50"
          onClick={resumeRecording}
          disabled={!isRecording || !isPaused}
        >
          Reanudar
        </button>

        <button
          className="rounded-2xl px-4 py-2 border disabled:opacity-50"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Detener
        </button>

        <button
          className="rounded-2xl px-4 py-2 border disabled:opacity-50"
          onClick={discard}
          disabled={isRecording || !blobUrl}
        >
          Descartar
        </button>

        <button
          className="rounded-2xl px-4 py-2 border disabled:opacity-50"
          onClick={transmit}
          disabled={!blobUrl}
        >
          Guardar
        </button>

      </div>

      {blobUrl && (
        <div className="space-y-3">
          <audio className="w-full" controls src={blobUrl} />
          <p className="text-xs text-gray-500">
            Previsualiza tu grabación. «Guardar» descarga el archivo. «Transmitir» lo envía a <code>/api/upload</code>.
          </p>
        </div>
      )}

      {/* Estado de subida */}
      {uploadStatus !== "idle" && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            uploadStatus === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : uploadStatus === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          {uploadMsg}
        </div>
      )}

      <details className="mt-8 cursor-pointer">
        <summary className="text-sm text-gray-600">Tips de compatibilidad</summary>
        <ul className="list-disc pl-5 text-sm text-gray-500 mt-2 space-y-1">
          <li>iOS Safari requiere un gesto del usuario para activar el micrófono.</li>
          <li>El tipo de archivo depende del navegador (webm/ogg/m4a). Se elige automáticamente un <code>mimeType</code> soportado.</li>
          <li>Para móviles, sirve el sitio por HTTPS para que el micrófono funcione.</li>
        </ul>
      </details>

      {/* Obtener la lista de audios y mostrarlos con un boton de play */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Audios subidos</h2>

        <ul className="space-y-2">
          
        </ul>

        <p className="text-sm text-gray-500">Funcionalidad de listado de audios no implementada.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Ejemplo opcional de endpoint en Next.js App Router:
// Crea app/api/upload/route.ts para recibir el FormData
// ─────────────────────────────────────────────────────────────
/*
// app/api/upload/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // o "edge" si solo procesas en memoria

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ message: "No file" }, { status: 400 });
    }

    // Aquí podrías subir a S3, Cloud Storage, etc.
    // Ejemplo: leer el buffer (Node runtime)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TODO: persistir buffer

    return NextResponse.json({ message: "Audio recibido", size: buffer.length });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "Upload error" }, { status: 500 });
  }
}
*/