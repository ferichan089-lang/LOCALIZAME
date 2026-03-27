"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Bell, Heart, Star, User, Home,
  MapPin, RefreshCw, AlertTriangle, ChevronRight, Wallet,
} from "lucide-react";
import type { AlertSummary } from "@/types";
import { AlertCard } from "./AlertCard";
import { CreateAlertModal } from "./CreateAlertModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";

const AlertMap = dynamic(() => import("./AlertMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#EDE8F6]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#7B2FB5] border-t-transparent animate-spin" />
        <span className="text-xs text-[#9999AA]">Cargando mapa…</span>
      </div>
    </div>
  ),
});

type Tab = "home" | "alerts" | "donate" | "points" | "profile";
interface Props { initialAlerts: AlertSummary[] }

export function HomeClient({ initialAlerts }: Props) {
  const [alerts, setAlerts]       = useState<AlertSummary[]>(initialAlerts);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab]             = useState<Tab>("home");
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive]  = useState(false);
  const { position }              = useGeolocation();

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

  const userPoints  = 450;
  const pointsNeeded = 1500;
  const walletMXN   = Math.floor((userPoints / pointsNeeded) * 50);

  /* ─── NAV ITEMS ─── */
  const navItems = [
    { id: "home"    as Tab, icon: Home,  label: "INICIO",  color: "#7B2FB5", badge: 0 },
    { id: "alerts"  as Tab, icon: Bell,  label: "ALERTAS", color: "#E53E3E", badge: alerts.length },
    { id: "donate"  as Tab, icon: Heart, label: "DONAR",   color: "#7B2FB5", badge: 0 },
    { id: "points"  as Tab, icon: Star,  label: "PUNTOS",  color: "#FFC107", badge: 0 },
    { id: "profile" as Tab, icon: User,  label: "PERFIL",  color: "#9999AA", badge: 0 },
  ];

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FFF8F0", fontFamily: "'Nunito', sans-serif" }}>

      {/* ══════════════════════ CONTENT ══════════════════════ */}
      <div className="flex-1 overflow-y-auto">

        {/* ─────────── HOME TAB ─────────── */}
        {tab === "home" && (
          <div className="flex flex-col pb-2">

            {/* ── Greeting ── */}
            <div className="px-5 pt-12 pb-3">
              <h1 className="text-[26px] font-black leading-tight" style={{ color: "#5A1D8E" }}>
                Hola,{" "}
                <span style={{ color: "#5A1D8E" }}>Diego</span>
                <span style={{ color: "#FFC107" }}>!</span>{" "}
                👋
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9999AA" }}>
                Tu comunidad está activa y conectada
              </p>
            </div>

            {/* ── Wallet Card (full width) ── */}
            <div className="px-5 mb-3">
              <div className="card-purple p-5 flex items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "#FFA000" }}>
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-lg leading-none">Mi Wallet</p>
                  <p className="text-[12px] text-white/75 mt-0.5 leading-tight">
                    Cobra recompensas y retira en OXXO
                  </p>
                </div>
                {/* Balance */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-3xl font-black text-white leading-none">${walletMXN}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">DISPONIBLE</p>
                </div>
              </div>
            </div>

            {/* ── Pulsera Localizadora Card (full width) ── */}
            <div className="px-5 mb-5">
              <button
                className="card-gold w-full p-4 flex items-center gap-4 text-left"
                onClick={() => setTab("profile")}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "#3E1F6E" }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[15px] leading-none" style={{ color: "#1A1025" }}>
                    Pulsera Localizadora
                  </p>
                  <p className="text-[12px] mt-0.5 leading-tight" style={{ color: "#5A4020" }}>
                    Actívala y protege a tu familia · <span style={{ color: "#7B2FB5" }}>Premium</span>
                  </p>
                </div>
                {/* Arrow */}
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "#3E1F6E" }} />
              </button>
            </div>

            {/* ── SOS SECTION ── */}
            <div className="flex flex-col items-center justify-center px-5 py-4">
              {/* Concentric rings + button */}
              <div className={`relative flex items-center justify-center mb-5 ${sosActive ? "sos-active" : "sos-idle"}`}>
                {/* Outer ring */}
                <div className="sos-ring-outer absolute"
                  style={{ width: 272, height: 272 }} />
                {/* Mid ring */}
                <div className="sos-ring-mid absolute"
                  style={{ width: 212, height: 212 }} />
                {/* Inner ring */}
                <div className="sos-ring-inner absolute"
                  style={{ width: 164, height: 164 }} />

                {/* SOS Button */}
                <button
                  className="sos-btn flex flex-col items-center justify-center relative z-10"
                  style={{ width: 148, height: 148 }}
                  onClick={() => { setSosActive(true); setShowCreate(true); }}
                >
                  <span className="font-black text-white tracking-wider leading-none"
                    style={{ fontSize: 44 }}>SOS</span>
                  <span className="font-bold text-white/70 uppercase mt-1"
                    style={{ fontSize: 11, letterSpacing: "0.20em" }}>ACTIVAR</span>
                </button>
              </div>

              {/* Helper text */}
              <p className="text-sm text-center" style={{ color: "#9999AA" }}>
                Notifica a personas cerca de ti
              </p>

              {/* Nearby alert banner */}
              {nearbyCount > 0 && (
                <div className="mt-4 w-full max-w-xs rounded-2xl p-3 flex items-center gap-3"
                  style={{ background: "#FFF0F0", border: "1px solid #FFD5D5" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FFE4E4" }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: "#E53E3E" }} />
                  </div>
                  <div>
                    <p className="text-xs font-black" style={{ color: "#C53030" }}>
                      {nearbyCount} alerta{nearbyCount > 1 ? "s" : ""} cerca de ti
                    </p>
                    <button onClick={() => setTab("alerts")}
                      className="text-xs font-bold" style={{ color: "#E53E3E" }}>
                      Ver alertas →
                    </button>
                  </div>
                </div>
              )}

              {/* Location chip */}
              <div className="mt-3 flex items-center gap-2 text-xs px-4 py-2 rounded-full font-bold"
                style={position
                  ? { background: "#F3E8FB", color: "#7B2FB5" }
                  : { background: "#FFF8E1", color: "#A66F00" }}>
                <MapPin className="w-3.5 h-3.5" />
                {position ? "Ubicación activa" : "Activa tu ubicación"}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── ALERTS TAB ─────────── */}
        {tab === "alerts" && (
          <div className="flex flex-col h-full">
            <div className="h-56 flex-shrink-0">
              <AlertMap alerts={sortedAlerts} userPosition={position} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #EEE4F8" }}>
                <h2 className="font-black text-sm" style={{ color: "#1A1025" }}>
                  Alertas activas
                  <span className="ml-2 text-xs font-normal" style={{ color: "#9999AA" }}>({alerts.length})</span>
                </h2>
                <button onClick={refresh} disabled={refreshing}
                  className="p-1.5 transition-colors" style={{ color: "#9999AA" }}>
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {sortedAlerts.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl">🌐</span>
                    <p className="text-sm mt-3" style={{ color: "#9999AA" }}>No hay alertas activas</p>
                  </div>
                ) : (
                  sortedAlerts.map(a => <AlertCard key={a.id} alert={a} userPosition={position} />)
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── DONATE TAB ─────────── */}
        {tab === "donate" && (
          <div className="p-5 pt-12">
            <h1 className="text-2xl font-black mb-1" style={{ color: "#5A1D8E" }}>Donar 💜</h1>
            <p className="text-sm mb-6" style={{ color: "#9999AA" }}>Apoya la búsqueda de personas desaparecidas</p>
            {alerts.filter(a => a.donationTarget > 0).length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">💰</span>
                <p className="text-sm mt-3" style={{ color: "#9999AA" }}>No hay fondos activos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.filter(a => a.donationTarget > 0).map(a => (
                  <div key={a.id} className="card p-4">
                    <p className="font-bold" style={{ color: "#1A1025" }}>{a.missingName}</p>
                    <p className="text-xs mt-1 mb-3" style={{ color: "#9999AA" }}>{a.lastSeenWhere}</p>
                    <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: "#F3E8FB" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min((a.donationRaised / a.donationTarget) * 100, 100)}%`,
                          background: "linear-gradient(90deg, #7B2FB5, #9B5FD0)",
                        }} />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="font-bold" style={{ color: "#7B2FB5" }}>${a.donationRaised.toLocaleString()}</span>
                      <span style={{ color: "#9999AA" }}>de ${a.donationTarget.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────── POINTS TAB ─────────── */}
        {tab === "points" && (
          <div className="p-5 pt-12">
            <h1 className="text-2xl font-black mb-1" style={{ color: "#5A1D8E" }}>Mis Puntos ⭐</h1>
            <p className="text-sm mb-6" style={{ color: "#9999AA" }}>Gana puntos ayudando a tu comunidad</p>

            {/* Points card */}
            <div className="card-purple p-5 mb-5">
              <p className="font-black text-white mb-1" style={{ fontSize: 48 }}>{userPoints}</p>
              <p className="text-sm text-white/70 mb-4">de {pointsNeeded} para cobrar $50 MXN</p>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.20)" }}>
                <div className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(userPoints / pointsNeeded) * 100}%` }} />
              </div>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                Faltan {pointsNeeded - userPoints} puntos
              </p>
            </div>

            {/* How to earn */}
            <div className="card p-4 space-y-3">
              <p className="font-bold text-sm mb-2" style={{ color: "#1A1025" }}>Cómo ganar puntos</p>
              {[
                { icon: "📍", label: "Información dentro de 2 km", pts: 100 },
                { icon: "💬", label: "Información general", pts: 50 },
                { icon: "💰", label: "Realizar una donación", pts: 25 },
                { icon: "🚨", label: "Crear una alerta", pts: 25 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2" style={{ color: "#1A1025" }}>
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <span className="text-sm font-black" style={{ color: "#7B2FB5" }}>+{item.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── PROFILE TAB ─────────── */}
        {tab === "profile" && (
          <div className="p-5 pt-12">
            <h1 className="text-2xl font-black mb-6" style={{ color: "#5A1D8E" }}>Mi Perfil 👤</h1>
            <div className="card p-5 text-center mb-5">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "#F3E8FB" }}>
                <User className="w-10 h-10" style={{ color: "#7B2FB5" }} />
              </div>
              <p className="font-black text-xl" style={{ color: "#1A1025" }}>Diego Ulises</p>
              <p className="text-sm" style={{ color: "#9999AA" }}>Miembro activo · CDMX</p>
            </div>
            <div className="card p-4 space-y-3">
              <p className="font-bold text-sm mb-2" style={{ color: "#1A1025" }}>Perfil físico privado</p>
              <p className="text-xs leading-relaxed" style={{ color: "#9999AA" }}>
                🔒 Tu información física está protegida. Solo se revelará si se activa una alerta de desaparición por ti o un familiar de confianza.
              </p>
              <button className="btn-primary w-full mt-2">Actualizar perfil físico</button>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════ BOTTOM NAV ══════════════════════ */}
      <div className="bottom-nav flex-shrink-0 flex items-stretch">
        {navItems.map(({ id, icon: Icon, label, color, badge }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all"
            >
              {/* Icon container */}
              <div className="relative">
                <div className="w-7 h-7 flex items-center justify-center">
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? color : "#C4C4D4" }}
                    strokeWidth={active ? 2.5 : 1.8}
                    fill={active && id === "donate" ? color : "none"}
                  />
                </div>
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{ background: "#E53E3E" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[9px] font-black uppercase tracking-wider"
                style={{ color: active ? color : "#C4C4D4" }}
              >
                {label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Create Modal ── */}
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
