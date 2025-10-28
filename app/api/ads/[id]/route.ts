import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!["READY", "ARCHIVED", "DRAFT", "PROCESSING", "FAILED"].includes(status))
      return NextResponse.json({ message: "Estado inválido" }, { status: 400 });

    const idNum = Number(params.id);
    const music = await prisma.ads.update({
      where: { id: idNum },
      data: { status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, music });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idNum = Number(params.id);
    const found = await prisma.ads.findUnique({
      where: { id: idNum },
      select: { id: true, filePath: true },
    });
    if (!found) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

    // intentar borrar archivo físico si existe ruta
    if (found.filePath) {
      try { await fs.unlink(found.filePath); } catch {}
    }

    await prisma.ads.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Error al eliminar" }, { status: 500 });
  }
}