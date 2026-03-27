import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOCALIZAME — Red de búsqueda comunitaria",
  description: "Plataforma comunitaria para encontrar personas desaparecidas en tiempo real. Alertas geolocalizadas, donaciones y recompensas por ayudar.",
  keywords: ["personas desaparecidas", "búsqueda", "comunidad", "México", "MONAD"],
  openGraph: {
    title: "LOCALIZAME",
    description: "Encuentra personas desaparecidas en tiempo real",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
