import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { AppKitProvider } from "@/context/AppKitProvider";
import { wagmiConfig } from "@/config";

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
  themeColor: "#FFF8F0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs        = await headers();
  const cookie      = hdrs.get("cookie") ?? "";
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html lang="es">
      <body className="antialiased">
        <AppKitProvider initialState={initialState}>
          {children}
        </AppKitProvider>
      </body>
    </html>
  );
}
