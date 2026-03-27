import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Server-side fetch for initial load
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

  return <HomeClient initialAlerts={JSON.parse(JSON.stringify(alerts))} />;
}
