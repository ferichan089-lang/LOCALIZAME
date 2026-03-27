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
  missingName: string; missingAge: string; missingGender: string;
  description: string; lastSeenWhere: string; lastSeenAt: string;
  height: string; skinTone: string; eyeColor: string; hairColor: string;
  clothingDesc: string; otherFeatures: string;
  contactName: string; contactPhone: string; donationTarget: string;
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
    setLoading(true); setError(null);
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
      setTimeout(() => onSuccess({ ...newAlert, _count: { tips: 0, donations: 0 } }), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear la alerta");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-black text-text mb-2">¡Alerta creada!</h3>
          <p className="text-sm text-muted">Notificando a personas en tu área…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col z-10 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-black text-text text-base">Reportar desaparición</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-border">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center transition-all
                ${i < step ? "bg-green-500 text-white" : i === step ? "bg-purple text-white" : "bg-purple-pale text-muted"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-semibold hidden sm:block flex-1 ${i === step ? "text-text" : "text-muted"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

          {step === 0 && (
            <>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Nombre completo *</label>
                <input className="input" placeholder="Nombre de la persona" value={form.missingName} onChange={e => set("missingName", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Edad</label>
                  <input className="input" type="number" placeholder="25" value={form.missingAge} onChange={e => set("missingAge", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Género</label>
                  <select className="input" value={form.missingGender} onChange={e => set("missingGender", e.target.value)}>
                    <option value="">Sin especificar</option>
                    <option>Masculino</option><option>Femenino</option><option>No binario</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Último lugar visto *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-purple" />
                  <input className="input pl-10" placeholder="Calle, colonia, referencia…" value={form.lastSeenWhere} onChange={e => set("lastSeenWhere", e.target.value)} />
                </div>
                {userPosition && <p className="text-[11px] text-purple font-semibold mt-1">📍 Se usará tu posición actual</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Fecha y hora *</label>
                <input className="input" type="datetime-local" value={form.lastSeenAt} onChange={e => set("lastSeenAt", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Circunstancias *</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="¿Qué pasó? ¿Cómo desapareció?" value={form.description} onChange={e => set("description", e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="bg-purple-pale rounded-2xl p-3 text-xs font-semibold text-purple">
                💡 Sé específico — cada detalle ayuda a identificar a la persona
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Estatura</label>
                  <input className="input" placeholder="1.68m" value={form.height} onChange={e => set("height", e.target.value)} /></div>
                <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Piel</label>
                  <select className="input" value={form.skinTone} onChange={e => set("skinTone", e.target.value)}>
                    <option value="">—</option>{["Muy claro","Claro","Medio","Moreno","Oscuro"].map(o=><option key={o}>{o}</option>)}
                  </select></div>
                <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Ojos</label>
                  <select className="input" value={form.eyeColor} onChange={e => set("eyeColor", e.target.value)}>
                    <option value="">—</option>{["Negro","Café","Verde","Azul","Gris","Miel"].map(o=><option key={o}>{o}</option>)}
                  </select></div>
                <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Cabello</label>
                  <select className="input" value={form.hairColor} onChange={e => set("hairColor", e.target.value)}>
                    <option value="">—</option>{["Negro","Castaño","Rubio","Rojo","Gris","Teñido"].map(o=><option key={o}>{o}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Ropa</label>
                <input className="input" placeholder="Describe la ropa del día" value={form.clothingDesc} onChange={e => set("clothingDesc", e.target.value)} /></div>
              <div><label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Señas particulares</label>
                <input className="input" placeholder="Tatuajes, cicatrices, lentes…" value={form.otherFeatures} onChange={e => set("otherFeatures", e.target.value)} /></div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Nombre del contacto</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted" />
                  <input className="input pl-10" placeholder="¿Quién reporta?" value={form.contactName} onChange={e => set("contactName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Teléfono de contacto</label>
                <input className="input" type="tel" placeholder="+52 55 0000 0000" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1.5 block uppercase tracking-wide">Meta de donación (MXN) — opcional</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted text-sm font-bold">$</span>
                  <input className="input pl-8" type="number" min={0} placeholder="0" value={form.donationTarget} onChange={e => set("donationTarget", e.target.value)} />
                </div>
              </div>
              <div className="bg-purple-pale rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-purple">🏆 Puntos por ayudar</p>
                {[["📍 Información ≤2km","100 pts"],["💬 Info general","50 pts"],["💰 Donar","25 pts"]].map(([l,p])=>(
                  <div key={l} className="flex justify-between text-xs"><span className="text-muted">{l}</span><span className="font-black text-purple">{p}</span></div>
                ))}
                <div className="border-t border-purple/10 pt-2 flex justify-between text-xs font-black">
                  <span className="text-text">1,500 puntos</span><span className="text-green-600">= $50 MXN</span>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-600 font-semibold">{error}</div>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1">← Atrás</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando…</> : <><AlertTriangle className="w-4 h-4" />Publicar alerta</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
