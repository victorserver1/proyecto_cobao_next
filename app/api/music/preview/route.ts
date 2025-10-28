import ytdl from "@distube/ytdl-core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/music/preview?url=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Falta parámetro ?url=" }, { status: 400 });
    }

    // 👇 Import dinámico para evitar el error de extracción

    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: "URL de YouTube no válida" }, { status: 400 });
    }

    const info = await ytdl.getInfo(url);
    const v = info.videoDetails;

    return NextResponse.json({
      ok: true,
      title: v.title,
      channel: v.author?.name ?? null,
      duration: Number(v.lengthSeconds ?? 0),
      thumbnail: v.thumbnails?.at(-1)?.url ?? null,
      videoId: v.videoId,
    });
  } catch (error: any) {
    console.error("Preview GET error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Error interno del servidor" },
      { status: 500 }
    );
  }
}
