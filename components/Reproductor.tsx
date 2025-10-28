'use client'
import { Radio, PlayCircle, Facebook, Instagram, PauseCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const Reproductor = () => {

      const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(0); // 🔊 nivel para el vúmetro
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // Canvas para el vumetro
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Evento cuando termina la radio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setIsPlaying(false);
      audioRef.current = null;
      toast.error("La radio ha dejado de reproducirse.");
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // 🎚️ Vúmetro optimizado
  useEffect(() => {
    let animationId: number;
    let frameCount = 0;

    if (isPlaying && audioRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 128; // menos muestras → menos consumo
      const buffer = new Uint8Array(analyser.frequencyBinCount);

      src.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");

      const update = () => {
        frameCount++;
        if (frameCount % 2 === 0) { // dibuja solo cada 2 frames (~30FPS)
          analyser.getByteTimeDomainData(buffer);

          if (canvasCtx && canvas) {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Dibujar la barra tipo vúmetro
            let sum = 0;
            for (let i = 0; i < buffer.length; i += 2) { // saltar muestras para ahorrar CPU
              const v = buffer[i] - 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / (buffer.length / 2));
            setLevel(rms);

            // Dibujar barra
            canvasCtx.fillStyle = "#34D399";
            canvasCtx.fillRect(0, 0, Math.min(rms * 2, canvas.width), canvas.height);
          }
        }
        animationId = requestAnimationFrame(update);
      };
      update();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (ctxRef.current) ctxRef.current.close();
    };
  }, [isPlaying]);

  // ▶️ Reproducir / Pausar
  const playRadio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://radio.radiocecyte.com/stream/1/");
      audioRef.current.crossOrigin = "anonymous";
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      toast.warning("Radio COBAO pausada.");
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          toast.success("Reproduciendo Radio COBAO");
        })
        .catch(() => {
          setIsPlaying(false);
          audioRef.current = null;
          toast.error("No se pudo reproducir la radio. Intenta de nuevo.");
        });
    }
  };
  return (
      <section className="flex flex-col items-center justify-center text-center px-6 py-14 bg-orange-900 w-full">
        

        <p className="text-lg md:text-xl max-w-2xl mb-6 text-slate-200">
          Música, noticias y la voz de los estudiantes del Colegio de Bachilleres del Estado de Oaxaca.
        </p>

        <button
          onClick={playRadio}
          className="bg-white hover:bg-[#ffcbcb]/80 text-[#8C233B] font-semibold rounded-full px-6 py-3 text-lg flex items-center gap-2 transition animate-bounce hover:scale-110 cursor-pointer"
        >
          {!isPlaying ? (
            <>
              <PlayCircle className="w-6 h-6" /> Escuchar Radio
            </>
          ) : (
            <>
              <PauseCircle className="w-6 h-6" /> Pausar Radio
            </>
          )}
        </button>

        {/* 🔊 Vúmetro optimizado */}
        {isPlaying && (
          <canvas
            ref={canvasRef}
            className="mt-6 w-48 h-4 bg-gray-300/40 rounded"
          />
        )}

        
      </section>

  )
}

export default Reproductor