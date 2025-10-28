
// /lib/audio/AudioProvider.tsx
'use client'
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface AudioCtx {
  isPlaying: boolean
  toggle: () => void
  ensureAudio: () => HTMLAudioElement
  // Para conectar un <canvas> externo como vúmetro
  attachCanvas: (el: HTMLCanvasElement | null) => void
}

const Ctx = createContext<AudioCtx | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const src = process.env.NEXT_PUBLIC_STREAM_URL || 'https://radio.radiocecyte.com/stream/1/'
      const el = new Audio(src)
      el.crossOrigin = 'anonymous'
      el.preload = 'none'
      audioRef.current = el
    }
    return audioRef.current!
  }, [])

  // ended
  useEffect(() => {
    const audio = ensureAudio()
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [ensureAudio])

  // analyser + draw (compartido)
  useEffect(() => {
    let animationId: number
    let frameCount = 0

    if (isPlaying && audioRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctxRef.current = ctx

      const srcNode = ctx.createMediaElementSource(audioRef.current)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      const buffer = new Uint8Array(analyser.frequencyBinCount)

      srcNode.connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = analyser

      const draw = () => {
        frameCount++
        animationId = requestAnimationFrame(draw)
        if (!canvasRef.current) return
        const g = canvasRef.current.getContext('2d')!
        if (!g || frameCount % 2 !== 0) return

        analyser.getByteTimeDomainData(buffer)
        const { width, height } = canvasRef.current
        g.clearRect(0, 0, width, height)

        let sum = 0
        for (let i = 0; i < buffer.length; i += 2) {
          const v = buffer[i] - 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / (buffer.length / 2))
        const bar = Math.min(rms * 2, width)

        g.fillStyle = '#E7A18F' // rojizo con glow sugerido por CSS
        g.fillRect(0, 0, bar, height)
      }
      draw()
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      analyserRef.current = null
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [isPlaying])

  const toggle = useCallback(() => {
    const audio = ensureAudio()
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }, [ensureAudio, isPlaying])

  const attachCanvas = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el
  }, [])

  const value: AudioCtx = { isPlaying, toggle, ensureAudio, attachCanvas }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAudio() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAudio debe usarse dentro de <AudioProvider>')
  return v
}
