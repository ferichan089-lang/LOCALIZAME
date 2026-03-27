"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Bell, Heart, Star, User, Home,
  MapPin, RefreshCw, AlertTriangle, ChevronRight,
  Wallet, Zap, ExternalLink, Trophy, TrendingUp,
} from "lucide-react";
import type { AlertSummary } from "@/types";
import { AlertCard } from "./AlertCard";
import { CreateAlertModal } from "./CreateAlertModal";
import { WalletButton, WalletCard } from "./WalletButton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm } from "@/lib/geo";

const AlertMap = dynamic(() => import("./AlertMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#EDE8F6" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#7B2FB5 transparent #7B2FB5 #7B2FB5" }} />
        <span className="text-xs" style={{ color: "#9999AA" }}>Cargando mapa…</span>
      </div>
    </div>
  ),
});

type Tab = "home" | "alerts" | "donate" | "points" | "profile";
interface Props { initialAlerts: AlertSummary[] }

const MONAD_EXPLORER = "https://testnet.monadexplorer.com";
const CONTRACT_ADDR  = "0x0CbAA7Ce9dED87e6e822d123C479dfC1077f456B";

export function HomeClient({ initialAlerts }: Props) {
  const [alerts, setAlerts]         = useState<AlertSummary[]>(initialAlerts);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab]               = useState<Tab>("home");
  const [refreshing, setRefreshing] = useState(false);
  const [sosActive, setSosActive]   = useState(false);
  const [monadLive, setMonadLive]   = useState(true);
  const { position }                = useGeolocation();

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

  // Check MONAD RPC liveness periodically
  useEffect(() => {
    const check = () =>
      fetch("https://testnet-rpc.monad.xyz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        signal: AbortSignal.timeout(4000),
      })
        .then(r => setMonadLive(r.ok))
        .catch(() => setMonadLive(false));
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, []);

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (!position) return 0;
    return distanceKm(position.lat, position.lng, a.lastLat, a.lastLng)
         - distanceKm(position.lat, position.lng, b.lastLat, b.lastLng);
  });

  const nearbyCount  = position
    ? alerts.filter(a => distanceKm(position.lat, position.lng, a.lastLat, a.lastLng) <= 2).length
    : 0;

  const onChainCount  = alerts.filter(a => a.txHash).length;
  const userPoints    = 450;
  const pointsNeeded  = 1500;
  const walletMXN     = Math.floor((userPoints / pointsNeeded) * 50);

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

      {/* ══════════ MONAD STATUS BAR ══════════ */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2"
        style={{ background: "#1A0A2E", minHeight: 40 }}>
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "#7B2FB5" }}>
            <span style={{ fontSize: 9, color: "white", fontWeight: 900 }}>M</span>
          </div>
          <span style={{ color: "#9B6FD0", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
            MONAD TESTNET
          </span>
        </div>

        {/* Center: On-chain count */}
        {onChainCount > 0 && (
          <div className="flex items-center gap-1">
            <span style={{ color: "#a0ff6f", fontSize: 9, fontWeight: 700 }}>
              {onChainCount} ALERTA{onChainCount > 1 ? "S" : ""} ON-CHAIN
            </span>
          </div>
        )}

        {/* Right: Wallet button + Live dot */}
        <div className="flex items-center gap-2">
          <WalletButton compact />
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: monadLive ? "#a0ff6f" : "#E53E3E",
                boxShadow: monadLive ? "0 0 6px #a0ff6f" : "none" }} />
            <span style={{ color: monadLive ? "#a0ff6f" : "#ff6f6f", fontSize: 9, fontWeight: 700 }}>
              {monadLive ? "LIVE" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <div className="flex-1 overflow-y-auto">

        {/* ─────────── HOME TAB ─────────── */}
        {tab === "home" && (
          <div className="flex flex-col pb-4">

            {/* ── Greeting ── */}
            <div className="px-5 pt-8 pb-4">
              <h1 className="font-black leading-tight" style={{ fontSize: 27, color: "#5A1D8E" }}>
                Hola, Diego<span style={{ color: "#FFC107" }}>!</span> 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9999AA" }}>
                Tu comunidad está activa y conectada
              </p>
            </div>

            {/* ── Wallet Card ── */}
            <div className="px-5 mb-3">
              <div className="card-purple p-5 flex items-center gap-4"
                style={{ borderRadius: 20 }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "#FFA000" }}>
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white" style={{ fontSize: 18, lineHeight: 1 }}>Mi Wallet</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3, lineHeight: 1.3 }}>
                    Cobra recompensas y retira en OXXO
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-black text-white" style={{ fontSize: 34, lineHeight: 1 }}>${walletMXN}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>DISPONIBLE</p>
                </div>
              </div>
            </div>

            {/* ── Pulsera Localizadora ── */}
            <div className="px-5 mb-5">
              <button className="card-gold w-full p-4 flex items-center gap-4 text-left"
                style={{ borderRadius: 20 }}
                onClick={() => setTab("profile")}>
                <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "#3E1F6E" }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black" style={{ fontSize: 15, color: "#1A1025", lineHeight: 1 }}>
                    Pulsera Localizadora
                  </p>
                  <p style={{ fontSize: 12, color: "#5A4020", marginTop: 3, lineHeight: 1.3 }}>
                    Actívala y protege a tu familia ·{" "}
                    <span style={{ color: "#7B2FB5", fontWeight: 700 }}>Premium</span>
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "#3E1F6E" }} />
              </button>
            </div>

            {/* ── SOS SECTION ── */}
            <div className="flex flex-col items-center justify-center px-5 pt-2 pb-4">
              <div className={`relative flex items-center justify-center mb-5 ${sosActive ? "sos-active" : "sos-idle"}`}>
                <div className="sos-ring-outer absolute" style={{ width: 268, height: 268 }} />
                <div className="sos-ring-mid absolute"   style={{ width: 208, height: 208 }} />
                <div className="sos-ring-inner absolute" style={{ width: 160, height: 160 }} />
                <button
                  className="sos-btn flex flex-col items-center justify-center relative z-10"
                  style={{ width: 145, height: 145 }}
                  onClick={() => { setSosActive(true); setShowCreate(true); }}
                >
                  <span className="font-black text-white" style={{ fontSize: 43, letterSpacing: "0.05em", lineHeight: 1 }}>
                    SOS
                  </span>
                  <span className="font-bold text-white" style={{ fontSize: 10, letterSpacing: "0.22em",
                    textTransform: "uppercase", opacity: 0.7, marginTop: 4 }}>
                    ACTIVAR
                  </span>
                </button>
              </div>

              <p className="text-sm text-center mb-4" style={{ color: "#9999AA" }}>
                Notifica a personas cerca de ti
              </p>

              {/* Nearby banner */}
              {nearbyCount > 0 && (
                <div className="w-full max-w-xs rounded-2xl p-3 mb-3 flex items-center gap-3"
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
              <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-full font-bold mb-5"
                style={position
                  ? { background: "#F3E8FB", color: "#7B2FB5" }
                  : { background: "#FFF8E1", color: "#A66F00" }}>
                <MapPin className="w-3.5 h-3.5" />
                {position ? "Ubicación activa" : "Activa tu ubicación"}
              </div>
            </div>

            {/* ── Live Activity Feed ── */}
            {alerts.length > 0 && (
              <div className="px-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: "#7B2FB5" }} />
                    <span className="text-sm font-black" style={{ color: "#1A1025" }}>Alertas Recientes</span>
                  </div>
                  <button onClick={() => setTab("alerts")}
                    className="text-xs font-bold" style={{ color: "#7B2FB5" }}>Ver todas →</button>
                </div>
                <div className="space-y-2">
                  {sortedAlerts.slice(0, 3).map(a => (
                    <MiniAlertCard key={a.id} alert={a} userPosition={position} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────── ALERTS TAB ─────────── */}
        {tab === "alerts" && (
          <div className="flex flex-col h-full">
            <div className="h-56 flex-shrink-0">
              <AlertMap alerts={sortedAlerts} userPosition={position} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid #EEE4F8" }}>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-sm" style={{ color: "#1A1025" }}>
                    Alertas activas
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "#F3E8FB", color: "#7B2FB5" }}>
                    {alerts.length}
                  </span>
                  {onChainCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                      style={{ background: "#1A0A2E", color: "#a0ff6f" }}>
                      <Zap className="w-2.5 h-2.5" />
                      {onChainCount} on-chain
                    </span>
                  )}
                </div>
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
          <div className="p-5 pt-10">
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
                  <div key={a.id} className="card p-4" style={{ borderRadius: 20 }}>
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
          <div className="p-5 pt-10">
            <h1 className="text-2xl font-black mb-1" style={{ color: "#5A1D8E" }}>Mis Puntos ⭐</h1>
            <p className="text-sm mb-5" style={{ color: "#9999AA" }}>Gana puntos ayudando a tu comunidad</p>

            {/* Points hero card */}
            <div className="card-purple p-5 mb-4" style={{ borderRadius: 20 }}>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="font-black text-white" style={{ fontSize: 52, lineHeight: 1 }}>{userPoints}</p>
                  <p className="text-white/70 text-sm">de {pointsNeeded} pts</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-white" style={{ fontSize: 28 }}>$50</p>
                  <p className="text-white/60" style={{ fontSize: 10, letterSpacing: "0.08em" }}>MXN REWARD</p>
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.20)" }}>
                <div className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(userPoints / pointsNeeded) * 100}%` }} />
              </div>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                Faltan {pointsNeeded - userPoints} puntos para cobrar
              </p>
            </div>

            {/* Leaderboard teaser */}
            <div className="card p-4 mb-4" style={{ borderRadius: 20 }}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4" style={{ color: "#FFC107" }} />
                <p className="font-black text-sm" style={{ color: "#1A1025" }}>Ranking de tu zona</p>
              </div>
              {[
                { rank: 1, name: "María G.",    pts: 1200, you: false },
                { rank: 2, name: "Carlos R.",   pts: 980,  you: false },
                { rank: 3, name: "Diego U.",    pts: 450,  you: true  },
              ].map(r => (
                <div key={r.rank} className="flex items-center gap-3 py-2"
                  style={{ borderBottom: r.rank < 3 ? "1px solid #EEE4F8" : "none" }}>
                  <span className="font-black" style={{ color: r.rank === 1 ? "#FFC107" : "#9999AA",
                    fontSize: r.rank === 1 ? 18 : 14, width: 24, textAlign: "center" }}>
                    {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}
                  </span>
                  <span className="flex-1 text-sm font-bold" style={{ color: r.you ? "#7B2FB5" : "#1A1025" }}>
                    {r.name}{r.you && " (Tú)"}
                  </span>
                  <span className="text-sm font-black" style={{ color: r.you ? "#7B2FB5" : "#9999AA" }}>
                    {r.pts}
                  </span>
                </div>
              ))}
            </div>

            {/* How to earn */}
            <div className="card p-4" style={{ borderRadius: 20 }}>
              <p className="font-black text-sm mb-3" style={{ color: "#1A1025" }}>Cómo ganar puntos</p>
              {[
                { icon: "📍", label: "Info dentro de 2 km", pts: 100, highlight: true },
                { icon: "💬", label: "Información general", pts: 50,  highlight: false },
                { icon: "💰", label: "Realizar donación",   pts: 25,  highlight: false },
                { icon: "🚨", label: "Crear una alerta",    pts: 25,  highlight: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2"
                  style={{ borderBottom: "1px solid #F5F0FA" }}>
                  <span className="text-sm flex items-center gap-2" style={{ color: "#1A1025" }}>
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <span className="text-sm font-black px-2 py-0.5 rounded-full"
                    style={item.highlight
                      ? { background: "#F3E8FB", color: "#7B2FB5" }
                      : { color: "#7B2FB5" }}>
                    +{item.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── PROFILE TAB ─────────── */}
        {tab === "profile" && (
          <div className="p-5 pt-10">
            <h1 className="text-2xl font-black mb-6" style={{ color: "#5A1D8E" }}>Mi Perfil 👤</h1>

            {/* Profile card */}
            <div className="card p-5 text-center mb-4" style={{ borderRadius: 20 }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "#F3E8FB" }}>
                <User className="w-10 h-10" style={{ color: "#7B2FB5" }} />
              </div>
              <p className="font-black text-xl" style={{ color: "#1A1025" }}>Diego Ulises</p>
              <p className="text-sm mb-3" style={{ color: "#9999AA" }}>Miembro activo · CDMX</p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: "#7B2FB5" }}>3</p>
                  <p className="text-xs" style={{ color: "#9999AA" }}>Alertas</p>
                </div>
                <div className="w-px" style={{ background: "#EEE4F8" }} />
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: "#7B2FB5" }}>450</p>
                  <p className="text-xs" style={{ color: "#9999AA" }}>Puntos</p>
                </div>
                <div className="w-px" style={{ background: "#EEE4F8" }} />
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: "#FFC107" }}>$15</p>
                  <p className="text-xs" style={{ color: "#9999AA" }}>MXN</p>
                </div>
              </div>
            </div>

            {/* Wallet section */}
            <WalletCard />

            {/* MONAD contract info */}
            <div className="card p-4 mb-4 flex items-center gap-3" style={{ borderRadius: 20, background: "#1A0A2E" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#7B2FB5" }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm" style={{ color: "#a0ff6f" }}>Contrato MONAD</p>
                <p className="text-xs font-mono truncate" style={{ color: "#9B6FD0" }}>
                  {CONTRACT_ADDR.slice(0, 18)}…
                </p>
              </div>
              <a href={`${MONAD_EXPLORER}/address/${CONTRACT_ADDR}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0">
                <ExternalLink className="w-4 h-4" style={{ color: "#9B6FD0" }} />
              </a>
            </div>

            {/* Privacy card */}
            <div className="card p-4" style={{ borderRadius: 20 }}>
              <p className="font-black text-sm mb-2" style={{ color: "#1A1025" }}>🔒 Perfil Físico Privado</p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#9999AA" }}>
                Tu información física está protegida. Solo se revelará si se activa una alerta de desaparición por ti o un familiar de confianza.
              </p>
              <button className="btn-primary w-full">Actualizar perfil físico</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ BOTTOM NAV ══════════ */}
      <div className="bottom-nav flex-shrink-0 flex items-stretch">
        {navItems.map(({ id, icon: Icon, label, color, badge }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-all">
              <div className="relative">
                <div className="w-7 h-7 flex items-center justify-center">
                  <Icon className="w-5 h-5"
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
              <span className="text-[9px] font-black uppercase tracking-wider"
                style={{ color: active ? color : "#C4C4D4" }}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: color }} />
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

/* ─── Mini Alert Card for Home Feed ─── */
function MiniAlertCard({
  alert,
  userPosition,
}: {
  alert: AlertSummary;
  userPosition?: { lat: number; lng: number } | null;
}) {
  const dist = userPosition
    ? distanceKm(userPosition.lat, userPosition.lng, alert.lastLat, alert.lastLng)
    : null;
  const isNearby = dist !== null && dist <= 2;

  return (
    <a href={`/alerta/${alert.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:opacity-80"
      style={{ background: "white", border: isNearby ? "1px solid #FFD5D5" : "1px solid #EEE4F8" }}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: "#F3E8FB" }}>
        👤
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-xs truncate" style={{ color: "#1A1025" }}>{alert.missingName}</p>
        <p className="text-xs truncate" style={{ color: "#9999AA" }}>{alert.lastSeenWhere}</p>
      </div>
      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {isNearby && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
            style={{ background: "#FFF0F0", color: "#E53E3E" }}>
            {Math.round(dist! * 1000)}m
          </span>
        )}
        {alert.txHash && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            style={{ background: "#1A0A2E", color: "#a0ff6f" }}>
            <Zap style={{ width: 8, height: 8 }} />
            chain
          </span>
        )}
      </div>
    </a>
  );
}
