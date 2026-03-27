import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  donorName: z.string().default("Anónimo"),
  amountMXN: z.number().min(10).max(100000),
  message: z.string().max(500).optional(),
  walletAddress: z.string().optional(),
  txHash: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = schema.parse(body);

    const donation = await prisma.donation.create({
      data: {
        alertId: id,
        ...data,
        status: data.txHash ? "confirmed" : "pending",
      },
    });

    await prisma.alert.update({
      where: { id },
      data: { donationRaised: { increment: data.amountMXN } },
    });

    return NextResponse.json({ donation, pointsEarned: 25 }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
