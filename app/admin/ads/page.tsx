// app/admin/ads/page.tsx
import { prisma } from "@/lib/prisma";
import AdsListClient from "./AdsListClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ManageAdsPage() {
  const items = await prisma.ads.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      url: true,
      status: true,       // READY | ARCHIVED | ...
      createdAt: true,
      filePath: true,     // si existe en tu modelo
      duration: true,     // si existe en tu modelo
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Anuncios</h1>
      <p className="text-sm text-gray-500">Sube, reproduce, archiva, transmite o elimina tus spots.</p>
      <AdsListClient initialItems={items} />
    </main>
  );
}