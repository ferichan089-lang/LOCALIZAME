import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "@reown/appkit/networks";

/* ── Project ID (Reown Dashboard) ── */
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "d8be7ffb4f9d64ac056ec4577291de0d";

/* ── MONAD Testnet custom chain ── */
export const monadTestnet = defineChain({
  id:        41454,
  caipNetworkId: "eip155:41454",
  chainNamespace: "eip155",
  name:      "MONAD Testnet",
  nativeCurrency: {
    name:     "MONAD",
    symbol:   "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url:  "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const networks = [monadTestnet];

/* ── Wagmi Adapter ── */
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr:     true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
