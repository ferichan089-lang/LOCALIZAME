"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bell, Heart, Star, User, Home, MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import type { AlertSummary } from "@/types";
import { AlertCard } from "./AlertCard";
import { CreateAlertModal } from "./CreateAlertModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";

const AlertMap = dynamic(() => import("./AlertMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-purple-pale">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple border-t-transparent animate-spin" />
        <span className="text-xs text-muted">Cargando mapa…</span>
      </div>
    </div>
  ),
});

type Tab = "home" | "alerts" | "donate" | "points" | "profile";

interface Props { initialAlerts: AlertSummary[] }

export function HomeClient({ initialAlerts }: Props) {
  const [alerts, setAlerts] = useState<AlertSummary[]>(initialAlerts);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const { position } = useGeolocation();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      if (res.ok) setAlerts(await res.json());
    } finally { setRefreshing(false); }
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 20_000);
    return () => clearInterval(t);
  }, [refresh]);

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (!position) return 0;
    return distanceKm(position.lat, position.lng, a.lastLat, a.lastLng)
         - distanceKm(position.lat, position.lng, b.lastLat, b.lastLng);
  });

  const nearbyCount = position
    ? alerts.filter(a => distanceKm(position.lat, position.lng, a.lastLat, a.lastLng) <= 2).length
    : 0;

  // Mock points for demo
  const userPoints = 450;
  const pointsNeeded = 1500;

  return (
    <div className="flex flex-col h-screen bg-bg font-sans">

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="px-5 pt-10 pb-4">
              <h1 className="text-2xl font-black text-purple-dark">
                Hola, Diego 👋
              </h1>
              <p className="text-sm text-muted mt-1">
                Tu comunidad está activa y conectada
              </p>
            </div>

            {/* Cards row */}
            <div className="px-5 grid grid-cols-2 gap-3 mb-6">
              {/* Wallet Card */}
              <div className="card-purple p-4 col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-dark/40 rounded-xl flex items-center justify-center">
                    <span className="text-sm">💳</span>
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Mi Wallet</span>
                </div>
                <p className="text-2xl font-black text-white">${Math.floor(userPoints / pointsNeeded * 50)}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">DISPONIBLE</p>
                <p className="text-[10px] text-white/50 mt-2 leading-tight">Cobra en OXXO o via transferencia</p>
              </div>

              {/* Points Card */}
              <div className="card-gold p-4 col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gold-dark/30 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-gold-dark" />
                  </div>
                  <span className="text-[10px] font-bold text-gold-dark/70 uppercase tracking-wide">Puntos</span>
                </div>
                <p className="text-2xl font-black text-gold-dark">{userPoints}</p>
                <p className="text-[10px] font-bold text-gold-dark/70 uppercase tracking-widest mt-0.5">DE {pointsNeeded}</p>
                {/* Progress */}
                <div className="h-1.5 bg-gold-dark/20 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gold-dark rounded-full"
                    style={{ width: `${(userPoints / pointsNeeded) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SOS Button — Hero */}
            <div className="flex flex-col items-center justify-center flex-1 px-5 py-2">
              {/* Ripple rings */}
              <div className="relative flex items-center justify-center mb-6">
                {/* Outer ring */}
                <div className={`sos-ring-outer absolute w-72 h-72 ${sosActive ? "sos-pulse" : ""}`} />
                {/* Mid ring */}
                <div className={`sos-ring-mid absolute w-56 h-56 ${sosActive ? "sos-pulse" : ""}`}
                  style={{ animationDelay: "0.2s" }} />
                {/* Inner ring */}
                <div className={`sos-ring-inner absolute w-44 h-44 ${sosActive ? "sos-pulse" : ""}`}
                  style={{ animationDelay: "0.4s" }} />

                {/* SOS Button */}
                <button
                  className="sos-btn w-36 h-36 flex flex-col items-center justify-center relative z-10"
                  onClick={() => { setSosActive(true); setShowCreate(true); }}
                >
                  <span className="text-4xl font-black text-white tracking-wider leading-none">SOS</span>
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mt-1">ACTIVAR</span>
                </button>
              </div>

              <p className="text-sm text-muted text-center">
                Notifica a personas cerca de ti
              </p>

              {/* Nearby alert if any */}
              {nearbyCount > 0 && (
                <div className="mt-4 w-full max-w-xs bg-red-50 border border-red-100 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-700">{nearbyCount} alerta{nearbyCount > 1 ? "s" : ""} cerca de ti</p>
                    <button onClick={() => setTab("alerts")} className="text-xs text-red-500 font-semibold">Ver alertas →</button>
                  </div>
                </div>
              )}

              {/* Location status */}
              <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
                position
                  ? "bg-purple-pale text-purple font-semibold"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
                <MapPin className="w-3.5 h-3.5" />
                {position ? "Ubicación activa" : "Activa tu ubicación para alertas"}
              </div>
            </div>
          </div>
        )}

        {/* ── ALERTS TAB ── */}
        {tab === "alerts" && (
          <div className="flex flex-col h-full">
            {/* Map */}
            <div className="h-56 flex-shrink-0">
              <AlertMap alerts={sortedAlerts} userPosition={position} />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="font-bold text-text text-sm">
                  Alertas activas
                  <span className="ml-2 text-xs font-normal text-muted">({alerts.length})</span>
                </h2>
                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="p-1.5 text-muted hover:text-purple transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {sortedAlerts.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl">🌐</span>
                    <p className="text-sm text-muted mt-3">No hay alertas activas</p>
                  </div>
                ) : (
                  sortedAlerts.map(a => <AlertCard key={a.id} alert={a} userPosition={position} />)
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DONATE TAB ── */}
        {tab === "donate" && (
          <div className="p-5 pt-10">
            <h1 className="text-2xl font-black text-purple-dark mb-1">Donar 💜</h1>
            <p className="text-sm text-muted mb-6">Apoya la búsqueda de personas desaparecidas</p>

            {alerts.filter(a => a.donationTarget > 0).length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">💰</span>
                <p className="text-sm text-muted mt-3">No hay fondos activos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.filter(a => a.donationTarget > 0).map(a => (
                  <div key={a.id} className="card p-4">
                    <p className="font-bold text-text">{a.missingName}</p>
                    <p className="text-xs text-muted mt-1 mb-3">{a.lastSeenWhere}</p>
                    <div className="h-2 bg-purple-pale rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((a.donationRaised / a.donationTarget) * 100, 100)}%`,
                          background: "linear-gradient(90deg, #7B3FBF, #9B6FD0)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="font-bold text-purple">${a.donationRaised.toLocaleString()}</span>
                      <span className="text-muted">de ${a.donationTarget.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── POINTS TAB ── */}
        {tab === "points" && (
          <div className="p-5 pt-10">
            <h1 className="text-2xl font-black text-purple-dark mb-1">Mis Puntos ⭐</h1>
            <p className="text-sm text-muted mb-6">Gana puntos ayudando a tu comunidad</p>

            {/* Points card */}
            <div className="card-purple p-5 mb-5">
              <p className="text-5xl font-black text-white mb-1">{userPoints}</p>
              <p className="text-sm text-white/70 mb-4">de {pointsNeeded} para cobrar $50 MXN</p>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(userPoints / pointsNeeded) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-2">
                Faltan {pointsNeeded - userPoints} puntos
              </p>
            </div>

            {/* How to earn */}
            <div className="card p-4 space-y-3">
              <p className="font-bold text-text text-sm">Cómo ganar puntos</p>
              {[
                { icon: "📍", label: "Información dentro de 2km", pts: 100, color: "text-purple" },
                { icon: "💬", label: "Información general", pts: 50, color: "text-purple" },
                { icon: "💰", label: "Realizar una donación", pts: 25, color: "text-purple" },
                { icon: "🚨", label: "Crear una alerta", pts: 25, color: "text-purple" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-text flex items-center gap-2">
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <span className={`text-sm font-bold ${item.color}`}>+{item.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="p-5 pt-10">
            <h1 className="text-2xl font-black text-purple-dark mb-6">Mi Perfil 👤</h1>
            <div className="card p-5 text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-purple-pale mx-auto mb-3 flex items-center justify-center">
                <User className="w-10 h-10 text-purple" />
              </div>
              <p className="font-black text-xl text-text">Diego Ulises</p>
              <p className="text-sm text-muted">Miembro activo · CDMX</p>
            </div>
            <div className="card p-4 space-y-3">
              <p className="font-bold text-text text-sm mb-2">Perfil físico privado</p>
              <p className="text-xs text-muted leading-relaxed">
                🔒 Tu información física está protegida. Solo se revelará si se activa una alerta de desaparición por ti o un familiar de confianza.
              </p>
              <button className="btn-primary w-full mt-2">Actualizar perfil físico</button>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Navigation ── */}
      <div className="bottom-nav flex-shrink-0 flex items-stretch">
        {([
          { id: "home"    as Tab, icon: Home,  label: "INICIO",   badge: 0 },
          { id: "alerts"  as Tab, icon: Bell,  label: "ALERTAS",  badge: alerts.length },
          { id: "donate"  as Tab, icon: Heart, label: "DONAR",    badge: 0 },
          { id: "points"  as Tab, icon: Star,  label: "PUNTOS",   badge: 0 },
          { id: "profile" as Tab, icon: User,  label: "PERFIL",   badge: 0 },
        ]).map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-all ${
              tab === id ? "text-purple" : "text-muted"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${tab === id ? "text-purple" : "text-muted"}`} />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${
              tab === id ? "text-purple" : "text-muted"
            }`}>
              {label}
            </span>
            {tab === id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-purple rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showCreate && (
        <CreateAlertModal
          onClose={() => { setShowCreate(false); setSosActive(false); }}
          onSuccess={(newAlert) => {
            setAlerts(prev => [newAlert, ...prev]);
            setShowCreate(false);
            setSosActive(false);
            setTab("alerts");
          }}
          userPosition={position}
        />
      )}
    </div>
  );
}
