import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { recordAlertOnChain } from "@/lib/blockchain";

// ─── GET /api/alerts ──────────────────────────────────────────
export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, missingName: true, missingAge: true, missingGender: true,
        description: true, photoUrl: true, lastSeenWhere: true, lastSeenAt: true,
        lastLat: true, lastLng: true, status: true, donationRaised: true,
        donationTarget: true, createdAt: true, txHash: true,
        _count: { select: { tips: true, donations: true } },
      },
    });
    return NextResponse.json(alerts, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("[GET /api/alerts]", e);
    return NextResponse.json({ error: "Error fetching alerts" }, { status: 500 });
  }
}

// ─── POST /api/alerts ─────────────────────────────────────────
const createSchema = z.object({
  missingName:   z.string().min(2).max(100),
  missingAge:    z.number().int().min(0).max(120).optional(),
  missingGender: z.string().optional(),
  description:   z.string().min(10).max(2000),
  lastSeenWhere: z.string().min(3).max(200),
  lastSeenAt:    z.string(),
  lastLat:       z.number(),
  lastLng:       z.number(),
  contactName:   z.string().optional(),
  contactPhone:  z.string().optional(),
  height:        z.string().optional(),
  skinTone:      z.string().optional(),
  eyeColor:      z.string().optional(),
  hairColor:     z.string().optional(),
  clothingDesc:  z.string().optional(),
  otherFeatures: z.string().optional(),
  donationTarget: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // 1. Save to PostgreSQL first (fast)
    const alert = await prisma.alert.create({
      data: { ...data, lastSeenAt: new Date(data.lastSeenAt) },
    });

    // 2. Record on MONAD blockchain (async, non-blocking)
    recordAlertOnChain({
      missingName: data.missingName,
      description: data.description,
      lat:         data.lastLat,
      lng:         data.lastLng,
    }).then(async (txHash) => {
      if (txHash) {
        await prisma.alert.update({
          where: { id: alert.id },
          data:  { txHash },
        });
        console.log(`✅ Alert ${alert.id} recorded on MONAD: ${txHash}`);
      }
    }).catch(err => console.error("Blockchain async error:", err));

    return NextResponse.json(alert, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: e.errors }, { status: 400 });
    }
    console.error("[POST /api/alerts]", e);
    return NextResponse.json({ error: "Error creating alert" }, { status: 500 });
  }
}
