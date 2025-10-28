import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// URL base pública (para generar URLs absolutas)
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function absUrl(req: Request, pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = PUBLIC_BASE ?? new URL(req.url).origin;
  return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function buildM3U(tracks: Array<{ title: string; url: string; duration?: number }>) {
  const lines = ["#EXTM3U"];
  for (const t of tracks) {
    const dur = Number.isFinite(t.duration) ? Math.max(0, Math.round(t.duration!)) : -1;
    lines.push(`#EXTINF:${dur},${t.title}`);
    lines.push(t.url);
  }
  return lines.join("\n") + "\n";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 500;
  const shuffle = searchParams.get("shuffle") === "true";

  const where: any = { status: "READY" };
  if (userId) where.userId = userId;

  const rows = await prisma.music.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(1000, Math.max(1, limit)),
    select: { title: true, url: true, duration: true },
  });

  let tracks = rows.map(r => ({
    title: r.title || "Sin título",
    url: absUrl(req, r.url),
    duration: r.duration ?? undefined,
  }));

  if (shuffle) {
    tracks = tracks.sort(() => Math.random() - 0.5);
  }

  const m3u = buildM3U(tracks);

  return new NextResponse(m3u, {
    status: 200,
    headers: {
      "Content-Type": "audio/x-mpegurl; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}