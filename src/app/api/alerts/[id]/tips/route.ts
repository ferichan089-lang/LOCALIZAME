import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { distanceKm, PROXIMITY_RADIUS_KM, POINTS_PROXIMITY, POINTS_REGULAR_TIP } from "@/lib/geo";
import { z } from "zod";

const schema = z.object({
  authorName: z.string().default("Anónimo"),
  content: z.string().min(5).max(1000),
  lat: z.number(),
  lng: z.number(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);

    const alert = await prisma.alert.findUnique({
      where: { id },
      select: { lastLat: true, lastLng: true },
    });
    if (!alert) return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });

    const dist = distanceKm(data.lat, data.lng, alert.lastLat, alert.lastLng);
    const isWithinRadius = dist <= PROXIMITY_RADIUS_KM;
    const pointsEarned = isWithinRadius ? POINTS_PROXIMITY : POINTS_REGULAR_TIP;

    const tip = await prisma.tip.create({
      data: { alertId: id, ...data, isWithinRadius, pointsEarned },
    });

    return NextResponse.json({ tip, pointsEarned, isWithinRadius, distanceKm: dist.toFixed(2) }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
