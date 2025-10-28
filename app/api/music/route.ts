import { NextResponse } from "next/server";
import path from "node:path";
import * as fs from "node:fs/promises";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeName(s: string) {
  return slugify(s, { lower: true, strict: true, trim: true }) || "audio";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ message: "Content-Type debe ser multipart/form-data" }, { status: 415 });
    }

    const form = await req.formData();

    const userId = (form.get("userId") as string) || "no-user";
    const titlePrefix = (form.get("name") as string) || "";

    // Archivos y nombres (orden conservado)
    const files = form.getAll("files").filter((v): v is File => v instanceof File);
    const namesRaw = form.getAll("names[]").map(String); // <- de tu UI con inputs por archivo

    if (!files.length) {
      return NextResponse.json({ message: "No se recibieron archivos" }, { status: 400 });
    }

    // Si tu FK es estricta, puedes validar que exista el usuario
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user) return NextResponse.json({ message: "userId no existe" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public", "music");
    await fs.mkdir(uploadDir, { recursive: true });

    const results: Array<
      | { ok: true; index: number; title: string; url: string; id: number }
      | { ok: false; index: number; error: string; filename?: string }
    > = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const mime = file.type || "";
        if (!/^audio\/mpeg$/i.test(mime)) {
          results.push({ ok: false, index: i, error: "Solo se acepta MP3 (audio/mpeg)", filename: file.name });
          continue;
        }

        const buf = Buffer.from(await file.arrayBuffer());

        // Título por archivo: names[] si viene, si no usa prefix o filename
        const provided = (namesRaw[i] ?? "").trim();
        const baseTitle = provided || titlePrefix || file.name.replace(/\.[^.]+$/, "") || "audio";

        const baseSafe = safeName(baseTitle);
        const fileName = `${baseSafe}-${Date.now()}-${i}.mp3`;
        const abs = path.join(uploadDir, fileName);
        const url = `/music/${fileName}`;

        await fs.writeFile(abs, buf);

        // IMPORTANTE: incluir userId si la FK es obligatoria
        const music = await prisma.music.create({
          data: {
            title: baseTitle,
            url,
            filePath: abs,            // quita si tu modelo no lo tiene
            mimeType: "audio/mpeg",   // quita si no lo usas
            sizeBytes: buf.length,    // quita si no lo usas
            status: "READY",          // quita si no tienes enum
                            // <- evita el Foreign key constraint
          },
        });

        results.push({ ok: true, index: i, title: music.title, url: music.url, id: music.id });
      } catch (err: any) {
        results.push({ ok: false, index: i, error: err?.message || "Error al guardar", filename: file.name });
      }
    }

    return NextResponse.json({ ok: true, count: files.length, results });
  } catch (e: any) {
    console.error("[upload multiple] error:", e);
    return NextResponse.json({ ok: false, message: e?.message ?? "Error al subir" }, { status: 500 });
  }
}