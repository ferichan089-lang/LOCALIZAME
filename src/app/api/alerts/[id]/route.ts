import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        tips: { orderBy: { createdAt: "desc" } },
        donations: { orderBy: { createdAt: "desc" } },
        _count: { select: { tips: true, donations: true } },
      },
    });
    if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(alert);
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowed = ["status", "isFound", "foundAt", "foundNotes"];
    const update = Object.fromEntries(
      Object.entries(body).filter(([k]) => allowed.includes(k))
    );

    const alert = await prisma.alert.update({ where: { id }, data: update });
    return NextResponse.json(alert);
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
