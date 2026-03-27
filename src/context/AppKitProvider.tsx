"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { wagmiAdapter, projectId, networks, monadTestnet } from "@/config";

/* ── Init AppKit (runs once) ── */
createAppKit({
  adapters:  [wagmiAdapter],
  projectId,
  networks:  networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  defaultNetwork: monadTestnet,
  metadata: {
    name:        "LOCALIZAME",
    description: "Red comunitaria para encontrar personas desaparecidas",
    url:         "https://localizame.vercel.app",
    icons:       ["https://localizame.vercel.app/icon.png"],
  },
  features: {
    analytics: true,
    email:     false,
    socials:   false,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix":         "#7B2FB5",
    "--w3m-color-mix-strength": 40,
    "--w3m-accent":            "#7B2FB5",
    "--w3m-border-radius-master": "4px",
  },
});

const queryClient = new QueryClient();

export function AppKitProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
