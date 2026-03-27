import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AlertDetailClient } from "@/components/AlertDetailClient";

export const dynamic = "force-dynamic";

export default async function AlertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      tips: { orderBy: { createdAt: "desc" } },
      donations: { orderBy: { createdAt: "desc" } },
      _count: { select: { tips: true, donations: true } },
    },
  });

  if (!alert) notFound();

  return <AlertDetailClient alert={JSON.parse(JSON.stringify(alert))} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await prisma.alert.findUnique({
    where: { id },
    select: { missingName: true, description: true },
  });
  if (!alert) return { title: "Alerta no encontrada" };
  return {
    title: `🔴 SE BUSCA: ${alert.missingName} — LOCALIZAME`,
    description: alert.description,
  };
}
