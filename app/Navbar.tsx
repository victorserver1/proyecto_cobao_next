'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function Header() {
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
        audioRef.current = new Audio("https://radio.totonix.com.mx/8006/stream/1/");
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
    <header className="bg-white text-white w-full mt-5 shadow-md shadow-black/30 h-30 flex items-center justify-between px-3 md:px-10 bg-white">
      {/* === IZQUIERDA: Logo retro === */}
      <div className="flex items-center justify-center px-4 py-4 rounded-2xl border-2 border-red-500/60 bg-gradient-to-b from-red-800 to-red-950 shadow-[0_0_35px_rgba(255,90,90,0.4)] ring-1 ring-red-700/50 w-[90vw] ">
        <div className="flex flex-col items-start leading-tight pr-6 border-r border-red-400/40">
          <h1 className="text-xl font-extrabold uppercase tracking-widest text-red-100 drop-shadow-[0_0_8px_#ffb4a2]">
            Aprende
          </h1>
          <h1 className="text-xl font-extrabold uppercase tracking-widest text-red-100 drop-shadow-[0_0_8px_#ffb4a2] -mt-1">
            al aire
          </h1>
          <span className="mt-1 text-xs font-medium text-red-200 tracking-[0.25em] uppercase">
            radio educativa
          </span>
        </div>

        <div className="ml-6 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_12px_#ff4d4d]" />
            </span>
            <span className="uppercase text-xs font-extrabold text-red-300 tracking-widest drop-shadow-[0_0_4px_#ff4d4d]">
              En vivo
            </span>
          </div>
          <div className="mt-1 h-[2px] w-8 bg-red-400/70 rounded-full blur-[1px] shadow-[0_0_10px_#ff4d4d]" />
        </div>
      </div>

      {/* === DERECHA: Botón retro de Play === */}
      <div className="flex items-center justify-center pl-4 md:pl-8">
      <button
        className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-red-700 to-red-900 border-4 border-red-500 shadow-[inset_0_4px_6px_rgba(0,0,0,0.5),_0_0_25px_rgba(255,60,60,0.4)] hover:shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),_0_0_45px_rgba(255,100,100,0.7)] transition-all duration-300 cursor-pointer"
        aria-label="Reproducir"

         onClick={playRadio}
      >
        {/* Brillo central */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-red-500/10 pointer-events-none" />

        {/* Icono Play */}
        {
          isPlaying ? (
            <Pause className="w-10 h-10 text-red-100 drop-shadow-[0_0_6px_#ffb4a2]" />
          ) : (
            <Play className="w-10 h-10 text-red-100 drop-shadow-[0_0_6px_#ffb4a2]" />
          )
        }
        
         
        

        {/* Reflejo tipo metal cromado */}
        <div className="absolute top-[6px] left-[6px] right-[6px] bottom-[6px] rounded-full border-t-2 border-white/10" />
      </button>
      </div>
    </header>
  )
}
