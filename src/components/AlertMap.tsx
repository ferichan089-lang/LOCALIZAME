"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AlertSummary } from "@/types";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// ── Icons ─────────────────────────────────────────────────────
const alertIcon = L.divIcon({
  className: "",
  iconSize: [44, 52],
  iconAnchor: [22, 52],
  popupAnchor: [0, -54],
  html: `<div style="position:relative;width:44px;height:52px">
    <div class="alert-marker-pulse" style="
      position:absolute;inset:0;bottom:8px;
      background:radial-gradient(circle at 50% 100%,#b91c1c,#ef4444);
      clip-path:polygon(50% 100%,0 35%,14% 0,86% 0,100% 35%);
      filter:drop-shadow(0 4px 20px rgba(239,68,68,0.7));
    "></div>
    <div style="
      position:absolute;top:10px;left:50%;transform:translateX(-50%);
      width:18px;height:18px;background:white;border-radius:50%;
      display:flex;align-items:center;justify-content:center;font-size:10px;
    ">👤</div>
  </div>`,
});

const userIcon = L.divIcon({
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#836ef9;border:3px solid white;
    box-shadow:0 0 0 6px rgba(131,110,249,0.25);
  "></div>`,
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  alerts: AlertSummary[];
  userPosition: { lat: number; lng: number } | null;
}

export default function AlertMap({ alerts, userPosition }: Props) {
  const router = useRouter();
  const center: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [19.4326, -99.1332];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        maxZoom={19}
      />

      {userPosition && (
        <>
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />
          <Circle
            center={[userPosition.lat, userPosition.lng]}
            radius={2000}
            pathOptions={{ color: "#836ef9", fillColor: "#836ef9", fillOpacity: 0.04, weight: 1, dashArray: "6 4" }}
          />
          <MapRecenter lat={userPosition.lat} lng={userPosition.lng} />
        </>
      )}

      {alerts.map(alert => (
        <Marker
          key={alert.id}
          position={[alert.lastLat, alert.lastLng]}
          icon={alertIcon}
        >
          <Popup>
            <div style={{ padding: "12px 14px", minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
                <strong style={{ fontSize: 14, color: "#f1f1f8", lineHeight: 1.2 }}>{alert.missingName}</strong>
              </div>
              {alert.missingAge && (
                <p style={{ fontSize: 11, color: "#9999c0", marginBottom: 4 }}>
                  {alert.missingAge} años{alert.missingGender ? ` · ${alert.missingGender}` : ""}
                </p>
              )}
              <p style={{ fontSize: 11, color: "#9999c0", marginBottom: 10 }}>
                📍 {alert.lastSeenWhere}
              </p>
              <p style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 12 }}>
                {formatDistanceToNow(new Date(alert.createdAt), { locale: es, addSuffix: true })}
              </p>
              <button
                onClick={() => router.push(`/alerta/${alert.id}`)}
                style={{
                  display: "block", width: "100%", background: "#ef4444",
                  color: "white", border: "none", borderRadius: 8, padding: "7px 12px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center",
                }}
              >
                Ver detalles →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
