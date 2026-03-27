"use client";

import Link from "next/link";
import { MapPin, Clock, Users, Heart, ChevronRight, Zap } from "lucide-react";
import type { AlertSummary } from "@/types";
import { distanceKm } from "@/lib/geo";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const MONAD_EXPLORER = "https://testnet.monadexplorer.com";

interface Props {
  alert: AlertSummary;
  userPosition?: { lat: number; lng: number } | null;
}

export function AlertCard({ alert, userPosition }: Props) {
  const dist     = userPosition
    ? distanceKm(userPosition.lat, userPosition.lng, alert.lastLat, alert.lastLng)
    : null;
  const isNearby = dist !== null && dist <= 2;

  return (
    <Link href={`/alerta/${alert.id}`}>
      <div
        className="rounded-2xl p-4 transition-all hover:-translate-y-0.5 cursor-pointer"
        style={{
          background: "white",
          border: isNearby ? "1.5px solid #FFD5D5" : "1.5px solid #EEE4F8",
          boxShadow: "0 2px 16px rgba(123,47,181,0.08)",
          borderRadius: 20,
        }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden text-xl"
            style={{ background: "#F3E8FB" }}>
            {alert.photoUrl
              ? <img src={alert.photoUrl} className="w-full h-full object-cover" alt="" />
              : "👤"
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-black text-sm leading-tight" style={{ color: "#1A1025" }}>
                  {alert.missingName}
                </p>
                {alert.missingAge && (
                  <p className="text-xs" style={{ color: "#9999AA" }}>
                    {alert.missingAge} años{alert.missingGender ? ` · ${alert.missingGender}` : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="badge-active text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                  Activa
                </span>
                {isNearby && dist !== null && (
                  <span className="text-[10px] font-black" style={{ color: "#E53E3E" }}>
                    {Math.round(dist * 1000)}m
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#9999AA" }}>
              {alert.description}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap"
              style={{ fontSize: 10, color: "#9999AA" }}>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: "#7B2FB5" }} />
                {alert.lastSeenWhere}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: "#7B2FB5" }} />
                {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap" style={{ fontSize: 10 }}>
              {alert._count.tips > 0 && (
                <span className="flex items-center gap-1 font-bold" style={{ color: "#7B2FB5" }}>
                  <Users className="w-3 h-3" />
                  {alert._count.tips} reporte{alert._count.tips !== 1 ? "s" : ""}
                </span>
              )}
              {alert.donationTarget > 0 && (
                <span className="flex items-center gap-1 font-bold" style={{ color: "#38A169" }}>
                  <Heart className="w-3 h-3" />
                  ${alert.donationRaised.toLocaleString()} MXN
                </span>
              )}
              {/* MONAD on-chain badge */}
              {alert.txHash && (
                <a
                  href={`${MONAD_EXPLORER}/tx/${alert.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "#1A0A2E", color: "#a0ff6f", fontSize: 9 }}
                >
                  <Zap style={{ width: 8, height: 8 }} />
                  MONAD
                </a>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#C4C4D4" }} />
        </div>

        {/* Donation progress bar */}
        {alert.donationTarget > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3E8FB" }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${Math.min((alert.donationRaised / alert.donationTarget) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #7B2FB5, #9B5FD0)",
                }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
