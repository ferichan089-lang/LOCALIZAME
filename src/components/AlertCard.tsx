"use client";

import Link from "next/link";
import { MapPin, Clock, Users, Heart, ChevronRight } from "lucide-react";
import type { AlertSummary } from "@/types";
import { distanceKm } from "@/lib/geo";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  alert: AlertSummary;
  userPosition?: { lat: number; lng: number } | null;
}

export function AlertCard({ alert, userPosition }: Props) {
  const dist = userPosition
    ? distanceKm(userPosition.lat, userPosition.lng, alert.lastLat, alert.lastLng)
    : null;

  const isNearby = dist !== null && dist <= 2;

  return (
    <Link href={`/alerta/${alert.id}`}>
      <div className={`glass rounded-xl p-3 cursor-pointer hover:border-white/12 transition-all hover:-translate-y-0.5 hover:shadow-lg ${isNearby ? "border-red-500/30 shadow-red-900/20" : ""}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-lg">
            {alert.photoUrl
              ? <img src={alert.photoUrl} className="w-full h-full rounded-full object-cover" alt="" />
              : "👤"
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-white leading-tight">{alert.missingName}</p>
                {alert.missingAge && (
                  <p className="text-xs text-white/40">{alert.missingAge} años{alert.missingGender ? ` · ${alert.missingGender}` : ""}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="badge-active text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Activa
                </span>
                {isNearby && (
                  <span className="text-[10px] text-red-400 font-semibold">¡{Math.round(dist! * 1000)}m de ti!</span>
                )}
              </div>
            </div>

            <p className="text-xs text-white/50 mt-1.5 line-clamp-2">{alert.description}</p>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#836ef9]" />
                {alert.lastSeenWhere}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-[10px]">
              {alert._count.tips > 0 && (
                <span className="flex items-center gap-1 text-[#836ef9]">
                  <Users className="w-3 h-3" />
                  {alert._count.tips} reporte{alert._count.tips !== 1 ? "s" : ""}
                </span>
              )}
              {alert.donationTarget > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <Heart className="w-3 h-3" />
                  ${alert.donationRaised.toLocaleString()} recaudados
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" />
        </div>

        {/* Donation bar */}
        {alert.donationTarget > 0 && (
          <div className="mt-2.5 ml-13">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#836ef9] to-green-400 rounded-full"
                style={{ width: `${Math.min((alert.donationRaised / alert.donationTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
