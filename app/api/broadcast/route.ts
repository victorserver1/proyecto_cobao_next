import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { audioUrl } = await req.json() as { audioUrl: string };
    if (!audioUrl) {
      return NextResponse.json({ error: "audioUrl requerido" }, { status: 400 });
    }

    // Construye y codifica la URL que consume tu servicio de transmisión
    // Ajusta host/puerto según tu setup real:
    const targetUrl = `http://localhost:8001/play?url=${audioUrl}`;

    const resp = await fetch(targetUrl, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: "Fallo al iniciar transmisión", detail: txt },
        { status: 502 }
      );
    }

    // Si tu servicio devuelve JSON, podrías reenviarlo:
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Excepción al iniciar transmisión", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
