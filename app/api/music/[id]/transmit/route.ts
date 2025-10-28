import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Configura tu base pública para el encoder/transmisor (cambia a tu IP/LAN si usas otro host)
const PUBLIC_BASE_URL ='http://192.168.2.18:3000'
// Endpoint del servicio de transmisión que ya usabas
const BROADCAST_BASE = process.env.BROADCAST_BASE || "http://192.168.2.18:8001/play?url=";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id
    const idNum = Number(id);
    const music = await prisma.music.findUnique({
      where: { id: idNum },
      select: { url: true },
    });
    if (!music) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    // Construye URL absoluta de tu MP3 público
    const fullUrl = `${PUBLIC_BASE_URL}${music.url.startsWith("/") ? "" : "/"}${music.url}`;
console.log(fullUrl)
    const res = await fetch(`${BROADCAST_BASE}${encodeURIComponent(fullUrl)}`);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, message: `Transmisor respondió ${res.status}`, detail: txt },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Error al transmitir" }, { status: 500 });
  }
}