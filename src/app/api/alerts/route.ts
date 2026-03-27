import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── GET /api/alerts ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, missingName: true, missingAge: true, missingGender: true,
        description: true, photoUrl: true, lastSeenWhere: true, lastSeenAt: true,
        lastLat: true, lastLng: true, status: true, donationRaised: true,
        donationTarget: true, createdAt: true,
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
  missingName: z.string().min(2).max(100),
  missingAge: z.number().int().min(0).max(120).optional(),
  missingGender: z.string().optional(),
  description: z.string().min(10).max(2000),
  lastSeenWhere: z.string().min(3).max(200),
  lastSeenAt: z.string(),
  lastLat: z.number(),
  lastLng: z.number(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  // Physical
  height: z.string().optional(),
  skinTone: z.string().optional(),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  clothingDesc: z.string().optional(),
  otherFeatures: z.string().optional(),
  // Donation
  donationTarget: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const alert = await prisma.alert.create({
      data: {
        ...data,
        lastSeenAt: new Date(data.lastSeenAt),
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: e.errors }, { status: 400 });
    }
    console.error("[POST /api/alerts]", e);
    return NextResponse.json({ error: "Error creating alert" }, { status: 500 });
  }
}
