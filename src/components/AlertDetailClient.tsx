"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, Clock, Users, Heart, MessageCircle, CheckCircle, Share2, Phone, Loader2, AlertTriangle } from "lucide-react";
import type { AlertDetail } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, PROXIMITY_RADIUS_KM } from "@/lib/geo";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

const AlertMap = dynamic(() => import("./AlertMap"), { ssr: false });

interface Props { alert: AlertDetail }

export function AlertDetailClient({ alert }: Props) {
  const router = useRouter();
  const { position } = useGeolocation();
  const [tipText, setTipText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tipSent, setTipSent] = useState(false);
  const [tipResult, setTipResult] = useState<{ pointsEarned: number; isWithinRadius: boolean } | null>(null);
  const [donateAmt, setDonateAmt] = useState("");
  const [donating, setDonating] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  const distance = position ? distanceKm(position.lat, position.lng, alert.lastLat, alert.lastLng) : null;
  const isNearby = distance !== null && distance <= PROXIMITY_RADIUS_KM;
  const donationPct = alert.donationTarget > 0 ? Math.min((alert.donationRaised / alert.donationTarget) * 100, 100) : 0;

  const sendTip = async () => {
    if (!tipText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/alerts/${alert.id}/tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: tipText,
          authorName: authorName || "Anónimo",
          lat: position?.lat ?? alert.lastLat,
          lng: position?.lng ?? alert.lastLng,
        }),
      });
      const data = await res.json();
      setTipResult({ pointsEarned: data.pointsEarned, isWithinRadius: data.isWithinRadius });
      setTipSent(true);
      setTipText("");
    } finally {
      setSubmitting(false);
    }
  };

  const sendDonation = async () => {
    const amt = parseFloat(donateAmt);
    if (!amt || amt < 10) return;
    setDonating(true);
    try {
      await fetch(`/api/alerts/${alert.id}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMXN: amt, donorName: "Anónimo" }),
      });
      setDonateOpen(false);
      setDonateAmt("");
      router.refresh();
    } finally {
      setDonating(false);
    }
  };

  const markFound = async () => {
    if (!confirm("¿Confirmar que la persona fue encontrada?")) return;
    await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED", isFound: true, foundAt: new Date().toISOString() }),
    });
    router.refresh();
  };

  const share = () => navigator.share?.({ title: `SE BUSCA: ${alert.missingName}`, url: window.location.href });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white truncate">{alert.missingName}</h1>
          <div className="flex items-center gap-2">
            {alert.status === "ACTIVE"
              ? <span className="badge-active text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Alerta activa</span>
              : <span className="badge-found text-[10px]"><CheckCircle className="w-3 h-3" /> Encontrado/a</span>
            }
            {distance !== null && (
              <span className="text-xs text-[#836ef9]">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} de ti
              </span>
            )}
          </div>
        </div>
        <button onClick={share} className="p-2 text-white/40 hover:text-white transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-10">
        {/* Map mini */}
        <div className="h-48 rounded-2xl overflow-hidden">
          <AlertMap
            alerts={[{ ...alert, _count: { tips: alert.tips.length, donations: alert.donations.length } }]}
            userPosition={position}
          />
        </div>

        {/* Main card */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-red-900/30 border border-red-500/20 flex items-center justify-center text-3xl flex-shrink-0">
              {alert.photoUrl ? <img src={alert.photoUrl} className="w-full h-full rounded-xl object-cover" alt="" /> : "👤"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{alert.missingName}</h2>
              {alert.missingAge && <p className="text-sm text-white/50">{alert.missingAge} años{alert.missingGender ? ` · ${alert.missingGender}` : ""}</p>}
              <p className="text-xs text-white/30 mt-1">
                Reportado {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="text-white/70">{alert.description}</p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <MapPin className="w-3 h-3 text-[#836ef9]" />
              <span>Último avistamiento: <strong className="text-white">{alert.lastSeenWhere}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock className="w-3 h-3 text-[#836ef9]" />
              <span>{format(new Date(alert.lastSeenAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</span>
            </div>
            {alert.contactPhone && (
              <div className="flex items-center gap-2 text-xs text-[#836ef9]">
                <Phone className="w-3 h-3" />
                <a href={`tel:${alert.contactPhone}`} className="hover:underline">{alert.contactPhone} — {alert.contactName || "Contacto"}</a>
              </div>
            )}
          </div>
        </div>

        {/* Physical description */}
        {(alert.height || alert.eyeColor || alert.skinTone || alert.clothingDesc) && (
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#836ef9]" /> Descripción física
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {alert.height && <div><span className="text-white/40">Estatura</span><p className="text-white">{alert.height}</p></div>}
              {alert.skinTone && <div><span className="text-white/40">Tono de piel</span><p className="text-white">{alert.skinTone}</p></div>}
              {alert.eyeColor && <div><span className="text-white/40">Ojos</span><p className="text-white">{alert.eyeColor}</p></div>}
              {alert.hairColor && <div><span className="text-white/40">Cabello</span><p className="text-white">{alert.hairColor}</p></div>}
            </div>
            {alert.clothingDesc && <p className="text-xs mt-2"><span className="text-white/40">Ropa: </span><span className="text-white">{alert.clothingDesc}</span></p>}
            {alert.otherFeatures && <p className="text-xs mt-1"><span className="text-white/40">Señas: </span><span className="text-white">{alert.otherFeatures}</span></p>}
          </div>
        )}

        {/* Donations */}
        {alert.donationTarget > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-400" /> Fondo de búsqueda
              </h3>
              <button onClick={() => setDonateOpen(true)} className="btn-accent text-xs px-3 py-1.5">Donar</button>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-[#836ef9] to-green-400 rounded-full" style={{ width: `${donationPct}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-400 font-semibold">${alert.donationRaised.toLocaleString()} MXN</span>
              <span className="text-white/30">de ${alert.donationTarget.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Proximity indicator */}
        {isNearby && alert.status === "ACTIVE" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              ¡Estás a {Math.round(distance! * 1000)}m de donde fue visto/a por última vez!
            </p>
            <p className="text-xs text-red-300/70 mt-1">Tu información contará como +100 puntos (radio 2km)</p>
          </div>
        )}

        {/* Tips form */}
        {alert.status === "ACTIVE" && (
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#836ef9]" />
              Aportar información
              {isNearby && <span className="text-xs text-green-400 font-normal">+100 pts</span>}
            </h3>

            {tipSent && tipResult ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                <p className="text-green-400 font-semibold">¡Información enviada!</p>
                <p className="text-xs text-green-300/70 mt-1">
                  +{tipResult.pointsEarned} puntos{tipResult.isWithinRadius ? " · Estabas en radio 2km ✓" : ""}
                </p>
                <button onClick={() => setTipSent(false)} className="text-xs text-white/40 mt-2 hover:text-white">Enviar más información</button>
              </div>
            ) : (
              <>
                <input
                  className="input mb-2"
                  placeholder="Tu nombre (opcional)"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                />
                <textarea
                  className="input min-h-[80px] resize-none mb-2"
                  placeholder="¿Viste a esta persona? ¿Tienes información? Describe dónde, cuándo, cualquier detalle…"
                  value={tipText}
                  onChange={e => setTipText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/30">
                    {position ? (isNearby ? "📍 En radio 2km → +100 pts" : `📍 ${distance?.toFixed(1)}km → +50 pts`) : "⚠ Sin ubicación"}
                  </p>
                  <button
                    onClick={sendTip}
                    disabled={submitting || !tipText.trim()}
                    className="btn-accent text-sm flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tips list */}
        {alert.tips.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#836ef9]" />
              Reportes de la comunidad ({alert.tips.length})
            </h3>
            <div className="space-y-3">
              {alert.tips.map(tip => (
                <div key={tip.id} className="bg-white/3 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#836ef9]">{tip.authorName}</span>
                    <div className="flex items-center gap-1.5">
                      {tip.isWithinRadius && <span className="text-[10px] bg-green-500/15 text-green-400 rounded px-1.5 py-0.5">📍 2km</span>}
                      <span className="text-[10px] text-white/30">{formatDistanceToNow(new Date(tip.createdAt), { locale: es, addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/70">{tip.content}</p>
                  {tip.pointsEarned > 0 && <p className="text-[10px] text-[#836ef9] mt-1">+{tip.pointsEarned} pts</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark as found (creator action) */}
        {alert.status === "ACTIVE" && (
          <button onClick={markFound} className="w-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/20 text-green-400 rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            <CheckCircle className="w-4 h-4" />
            ¡Persona encontrada! — Cerrar alerta
          </button>
        )}
      </div>

      {/* Donate modal */}
      {donateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75" onClick={() => setDonateOpen(false)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-sm z-10">
            <h3 className="font-bold text-white mb-1">Hacer una donación</h3>
            <p className="text-xs text-white/40 mb-4">v2: registrada en MONAD blockchain</p>
            <div className="flex gap-2 mb-3">
              {[50, 100, 200, 500].map(a => (
                <button key={a} onClick={() => setDonateAmt(String(a))}
                  className={`flex-1 py-2 text-xs rounded-lg transition-colors ${donateAmt === String(a) ? "bg-[#836ef9] text-white" : "bg-white/5 text-white/50 hover:text-white"}`}>
                  ${a}
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
              <input className="input pl-7" type="number" min={10} placeholder="Otro monto" value={donateAmt} onChange={e => setDonateAmt(e.target.value)} />
              <span className="absolute right-3 top-2.5 text-white/30 text-sm">MXN</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDonateOpen(false)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={sendDonation} disabled={donating || !donateAmt} className="btn-accent flex-1 flex items-center justify-center gap-2">
                {donating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
                Donar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
