'use client';

import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';
import {
  Play,
  Pause,
  Radio,
  Waves,
  Loader2,
  User as UserIcon,
  Trash2,
  Archive,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { archiveAudio, deleteAudio } from '@/app/actions/audio';
import Swal from 'sweetalert2';

type AudioWithAuthor = Prisma.AudioGetPayload<{
  include: { author: true };
}>;

const statusColor: Record<'PUBLISHED' | 'DRAFT', string> = {
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function AudioCard({
  audio,
  toggleBroadcastStatus,
}: {
  audio: AudioWithAuthor;
  toggleBroadcastStatus: (
    audioId: number,
    status: 'PUBLISHED' | 'DRAFT'
  ) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const absoluteSrc = useMemo(
    () =>
      audio.url?.startsWith('http')
        ? audio.url
        : `http://192.168.2.18:3000${audio.url}`,
    [audio.url]
  );

  const initials = useMemo(() => {
    const n = audio.author?.name ?? '';
    const parts = n.trim().split(/\s+/);
    return (
      parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'AU'
    );
  }, [audio.author?.name]);

  const playPause = async () => {
    try {
      if (!playerRef.current) {
        playerRef.current = new Audio(absoluteSrc);
        playerRef.current.onended = () => setIsPlaying(false);
        
      }
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
        toast.success('Audio pausado');
      } else {
        await playerRef.current.play();
        setIsPlaying(true);
        toast.success('Reproduciendo audio');
      }
    } catch (e) {
      console.error('No se pudo reproducir:', e);
        toast.error('No se pudo reproducir el audio. Intenta de nuevo.');
    }
  };

  const broadcastAudio = async () => {
    try {
      setBusy(true);
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: absoluteSrc }),
      });

      if (!response.ok) {
        const { error, detail } = await response.json().catch(() => ({}));
        console.error('Broadcast error:', error, detail);
        toast.error('Error al iniciar la transmisión. Revisa la consola.');
        return;
      }

      await toggleBroadcastStatus(audio.id, 'PUBLISHED');
      toast.success('Transmisión iniciada');

      startTransition(() => router.refresh());
    } catch (error) {
      console.error('Error broadcasting audio:', error);
        toast.error('Error al iniciar la transmisión. Contacte a un administrador.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async() => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async(result) => {
      if (result.isConfirmed) {
        await deleteAudio(audio.id);
        toast.success('Audio eliminado');
        router.refresh();
      }
    });
  };

  const handleArchive = async () => {
    console.log('Archivar audio', audio.id);

    await archiveAudio(audio.id, audio.status);
    toast.success('Estado de audio actualizado');
    router.refresh();
    // Aquí agregas tu lógica para archivar el audio
  };

  return (
    <Card className="group relative overflow-hidden border border-border/60 hover:shadow-lg transition-shadow">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50">
            {audio.author?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={audio.author.image}
                alt={audio.author.name ?? 'Autor'}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {initials}
              </span>
            )}
            <div className="pointer-events-none absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border bg-background p-1 shadow">
              <UserIcon
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold leading-tight">
                {audio.title ?? 'Audio sin título'}
              </h3>
              <Badge
                className={`border ${statusColor[audio.status as 'PUBLISHED' | 'DRAFT']}`}
                variant="secondary"
              >
                {audio.status}
              </Badge>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {audio.author?.name ?? 'Autor desconocido'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-blue-600"
                  onClick={handleArchive}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archivar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <Separator className="mx-6 my-2" />

      {/* Contenido */}
 

      {/* Controles */}
      <CardFooter className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={playPause}
            variant="default"
            size="sm"
            className="rounded-full"
            disabled={busy || isPending}
          >
            {isPlaying ? (
              <Pause className="mr-2 h-4 w-4" aria-hidden />
            ) : (
              <Play className="mr-2 h-4 w-4" aria-hidden />
            )}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </Button>
        </div>

        <Button
          onClick={broadcastAudio}
          variant="secondary"
          size="sm"
          className="border border-green-200 text-green-700 hover:text-green-800 hover:bg-green-50"
          disabled={busy || isPending}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Iniciando…
            </>
          ) : (
            <>
              <Radio className="mr-2 h-4 w-4" aria-hidden />
              Transmitir
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
