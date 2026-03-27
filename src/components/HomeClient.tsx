"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bell, MapPin, AlertTriangle, Users, ChevronRight, RefreshCw } from "lucide-react";
import type { AlertSummary } from "@/types";
import { AlertCard } from "./AlertCard";
import { CreateAlertModal } from "./CreateAlertModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const AlertMap = dynamic(() => import("./AlertMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#12121a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#836ef9] border-t-transparent animate-spin" />
        <span className="text-xs text-white/40">Cargando mapa…</span>
      </div>
    </div>
  ),
});

interface Props { initialAlerts: AlertSummary[] }

export function HomeClient({ initialAlerts }: Props) {
  const [alerts, setAlerts] = useState<AlertSummary[]>(initialAlerts);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"map" | "list">("map");
  const [refreshing, setRefreshing] = useState(false);
  const { position } = useGeolocation();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      if (res.ok) setAlerts(await res.json());
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 20s
  useEffect(() => {
    const t = setInterval(refresh, 20_000);
    return () => clearInterval(t);
  }, [refresh]);

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (!position) return 0;
    return (
      distanceKm(position.lat, position.lng, a.lastLat, a.lastLng) -
      distanceKm(position.lat, position.lng, b.lastLat, b.lastLng)
    );
  });

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">LOCALIZAME</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">
                {alerts.length} alerta{alerts.length !== 1 ? "s" : ""} activa{alerts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Crear alerta
          </button>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-white/5 text-xs overflow-x-auto">
        <span className="flex items-center gap-1.5 text-white/50 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <strong className="text-red-400">{alerts.filter(a => a.status === "ACTIVE").length}</strong> activas
        </span>
        <span className="text-white/20">·</span>
        <span className="flex items-center gap-1.5 text-white/50 whitespace-nowrap">
          <Users className="w-3 h-3" />
          <strong className="text-white">{alerts.reduce((s, a) => s + a._count.tips, 0)}</strong> reportes
        </span>
        <span className="text-white/20">·</span>
        {position ? (
          <span className="flex items-center gap-1 text-[#836ef9] whitespace-nowrap">
            <MapPin className="w-3 h-3" />
            Ubicación activa
          </span>
        ) : (
          <span className="text-yellow-500/70 whitespace-nowrap">⚠ Sin ubicación</span>
        )}
      </div>

      {/* ── Tab bar (mobile) ── */}
      <div className="flex-shrink-0 flex md:hidden border-b border-white/5">
        {(["map", "list"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? "text-[#836ef9] border-b-2 border-[#836ef9]" : "text-white/40"
            }`}
          >
            {t === "map" ? "🗺 Mapa" : `📋 Lista (${alerts.length})`}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className={`${tab === "map" ? "flex" : "hidden"} md:flex flex-1 relative`}>
          <AlertMap
            alerts={sortedAlerts}
            userPosition={position}
            onCreateAlert={() => setShowCreate(true)}
          />
          {/* FAB on map */}
          <button
            onClick={() => setShowCreate(true)}
            className="md:hidden absolute bottom-6 right-4 z-[1000] bg-red-600 hover:bg-red-500 text-white rounded-full px-5 py-3 font-semibold text-sm flex items-center gap-2 shadow-2xl shadow-red-900/60 transition-all hover:scale-105"
          >
            <Bell className="w-4 h-4" />
            Crear Alerta
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          ${tab === "list" ? "flex" : "hidden"} md:flex
          flex-col w-full md:w-80 lg:w-96
          border-l border-white/5 overflow-hidden bg-[#0a0a0f]
        `}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">Alertas recientes</h2>
            {position && <span className="text-xs text-white/30">ordenadas por distancia</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sortedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <span className="text-4xl">🌐</span>
                <p className="text-sm text-white/40 text-center">
                  No hay alertas activas.<br />
                  <span className="text-white/60">¡Todo parece tranquilo!</span>
                </p>
              </div>
            ) : (
              sortedAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} userPosition={position} />
              ))
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block p-3 border-t border-white/5">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Reportar persona desaparecida
            </button>
          </div>
        </aside>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateAlertModal
          onClose={() => setShowCreate(false)}
          onSuccess={(newAlert) => {
            setAlerts(prev => [newAlert, ...prev]);
            setShowCreate(false);
          }}
          userPosition={position}
        />
      )}
    </div>
  );
}
