"use client";

import { useState } from "react";
import { X, AlertTriangle, MapPin, User, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import type { AlertSummary } from "@/types";

const STEPS = ["Persona", "Descripción física", "Contacto"];

interface Props {
  onClose: () => void;
  onSuccess: (alert: AlertSummary) => void;
  userPosition?: { lat: number; lng: number } | null;
}

interface FormState {
  missingName: string;
  missingAge: string;
  missingGender: string;
  description: string;
  lastSeenWhere: string;
  lastSeenAt: string;
  // physical
  height: string;
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  clothingDesc: string;
  otherFeatures: string;
  // contact
  contactName: string;
  contactPhone: string;
  donationTarget: string;
}

const INITIAL: FormState = {
  missingName: "", missingAge: "", missingGender: "",
  description: "", lastSeenWhere: "",
  lastSeenAt: new Date().toISOString().slice(0, 16),
  height: "", skinTone: "", eyeColor: "", hairColor: "",
  clothingDesc: "", otherFeatures: "",
  contactName: "", contactPhone: "", donationTarget: "0",
};

export function CreateAlertModal({ onClose, onSuccess, userPosition }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.missingName.length >= 2 && form.description.length >= 10 && form.lastSeenWhere.length >= 3;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missingName: form.missingName,
          missingAge: form.missingAge ? parseInt(form.missingAge) : undefined,
          missingGender: form.missingGender || undefined,
          description: form.description,
          lastSeenWhere: form.lastSeenWhere,
          lastSeenAt: form.lastSeenAt || new Date().toISOString(),
          lastLat: userPosition?.lat ?? 19.4326,
          lastLng: userPosition?.lng ?? -99.1332,
          height: form.height || undefined,
          skinTone: form.skinTone || undefined,
          eyeColor: form.eyeColor || undefined,
          hairColor: form.hairColor || undefined,
          clothingDesc: form.clothingDesc || undefined,
          otherFeatures: form.otherFeatures || undefined,
          contactName: form.contactName || undefined,
          contactPhone: form.contactPhone || undefined,
          donationTarget: parseFloat(form.donationTarget) || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear la alerta");
      }

      const newAlert = await res.json();
      setSuccess(true);
      setTimeout(() => {
        onSuccess({ ...newAlert, _count: { tips: 0, donations: 0 } });
      }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear la alerta");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative glass rounded-2xl p-8 w-full max-w-sm text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">¡Alerta creada!</h3>
          <p className="text-sm text-white/50">Notificando a personas en tu área…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-[#0e0e1a] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="font-bold text-white">Reportar desaparición</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all
                ${i < step ? "bg-green-500 text-white" : i === step ? "bg-[#836ef9] text-white" : "bg-white/5 text-white/30"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] hidden sm:block flex-1 ${i === step ? "text-white" : "text-white/30"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/5 hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Step 0: Basic info */}
          {step === 0 && (
            <>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Nombre completo *</label>
                <input className="input" placeholder="Nombre de la persona" value={form.missingName} onChange={e => set("missingName", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Edad</label>
                  <input className="input" type="number" placeholder="Ej: 25" value={form.missingAge} onChange={e => set("missingAge", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Género</label>
                  <select className="input" value={form.missingGender} onChange={e => set("missingGender", e.target.value)}>
                    <option value="">Sin especificar</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>No binario</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Último lugar conocido *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#836ef9]" />
                  <input className="input pl-9" placeholder="Calle, colonia, referencia…" value={form.lastSeenWhere} onChange={e => set("lastSeenWhere", e.target.value)} />
                </div>
                {!userPosition && (
                  <p className="text-[11px] text-yellow-500/70 mt-1">⚠ Activa tu ubicación para mayor precisión</p>
                )}
                {userPosition && (
                  <p className="text-[11px] text-[#836ef9] mt-1">📍 Se usará tu posición actual</p>
                )}
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Fecha y hora del último avistamiento *</label>
                <input className="input" type="datetime-local" value={form.lastSeenAt} onChange={e => set("lastSeenAt", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Describe las circunstancias *</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="¿Qué pasó? ¿Cómo desapareció? ¿Contexto importante…"
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 1: Physical */}
          {step === 1 && (
            <>
              <div className="glass rounded-xl p-3 text-xs text-[#836ef9]">
                💡 Esta información ayuda a identificar a la persona. Sé lo más específico posible.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Estatura</label>
                  <input className="input" placeholder="Ej: 1.68m" value={form.height} onChange={e => set("height", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Tono de piel</label>
                  <select className="input" value={form.skinTone} onChange={e => set("skinTone", e.target.value)}>
                    <option value="">—</option>
                    {["Muy claro", "Claro", "Medio", "Moreno", "Oscuro"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Color de ojos</label>
                  <select className="input" value={form.eyeColor} onChange={e => set("eyeColor", e.target.value)}>
                    <option value="">—</option>
                    {["Negro", "Café", "Verde", "Azul", "Gris", "Miel"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Color de cabello</label>
                  <select className="input" value={form.hairColor} onChange={e => set("hairColor", e.target.value)}>
                    <option value="">—</option>
                    {["Negro", "Castaño", "Rubio", "Rojo", "Gris", "Teñido"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Ropa que llevaba puesta</label>
                <input className="input" placeholder="Describe la ropa del día de la desaparición" value={form.clothingDesc} onChange={e => set("clothingDesc", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Señas particulares</label>
                <input className="input" placeholder="Tatuajes, cicatrices, lunares, lentes…" value={form.otherFeatures} onChange={e => set("otherFeatures", e.target.value)} />
              </div>
            </>
          )}

          {/* Step 2: Contact + Donations */}
          {step === 2 && (
            <>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Nombre del contacto</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/30" />
                  <input className="input pl-9" placeholder="¿Quién reporta?" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Teléfono de contacto</label>
                <input className="input" type="tel" placeholder="+52 55 0000 0000" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-xs text-white/50 mb-1.5 block">
                  Meta de donación (MXN) — opcional
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
                  <input className="input pl-7" type="number" min={0} step={100} placeholder="0" value={form.donationTarget} onChange={e => set("donationTarget", e.target.value)} />
                </div>
              </div>

              {/* Points system info */}
              <div className="glass rounded-xl p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-white">🏆 Sistema de puntos y recompensas</p>
                <div className="space-y-1.5 text-[11px] text-white/50">
                  <div className="flex justify-between"><span>📍 Información desde ≤2km</span><span className="text-[#836ef9] font-bold">+100 pts</span></div>
                  <div className="flex justify-between"><span>💬 Información general</span><span className="text-[#836ef9] font-bold">+50 pts</span></div>
                  <div className="flex justify-between"><span>💰 Donación</span><span className="text-[#836ef9] font-bold">+25 pts</span></div>
                  <div className="border-t border-white/5 pt-1.5 flex justify-between font-semibold">
                    <span className="text-white">1,500 puntos</span>
                    <span className="text-green-400">= $50 MXN</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/30">v2: recompensas on-chain via MONAD · smart contract listo</p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/5">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">
              ← Atrás
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-accent flex-1 flex items-center justify-center gap-2"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publicando…</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> Publicar alerta</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
