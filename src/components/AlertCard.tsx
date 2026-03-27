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
      <div className={`bg-white rounded-2xl p-4 shadow-card border transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
        isNearby ? "border-red-200 bg-red-50/30" : "border-border"
      }`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-purple-pale border border-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden text-xl">
            {alert.photoUrl
              ? <img src={alert.photoUrl} className="w-full h-full object-cover" alt="" />
              : "👤"
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm text-text leading-tight">{alert.missingName}</p>
                {alert.missingAge && (
                  <p className="text-xs text-muted">{alert.missingAge} años{alert.missingGender ? ` · ${alert.missingGender}` : ""}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="badge-active text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Activa
                </span>
                {isNearby && (
                  <span className="text-[10px] text-red-500 font-bold">{Math.round(dist! * 1000)}m</span>
                )}
              </div>
            </div>

            <p className="text-xs text-muted mt-1.5 line-clamp-2">{alert.description}</p>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple" />
                {alert.lastSeenWhere}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple" />
                {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
              </span>
            </div>

            {(alert._count.tips > 0 || alert.donationTarget > 0) && (
              <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                {alert._count.tips > 0 && (
                  <span className="flex items-center gap-1 text-purple font-semibold">
                    <Users className="w-3 h-3" />
                    {alert._count.tips} reporte{alert._count.tips !== 1 ? "s" : ""}
                  </span>
                )}
                {alert.donationTarget > 0 && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <Heart className="w-3 h-3" />
                    ${alert.donationRaised.toLocaleString()} MXN
                  </span>
                )}
              </div>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
        </div>

        {alert.donationTarget > 0 && (
          <div className="mt-3 ml-15">
            <div className="h-1.5 bg-purple-pale rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((alert.donationRaised / alert.donationTarget) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #7B3FBF, #9B6FD0)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
