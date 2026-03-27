"use client";

import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { Wallet, ChevronDown, AlertCircle } from "lucide-react";

const MONAD_CHAIN_ID = 41454;

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { open }          = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId }       = useAppKitNetwork();

  const wrongNetwork = isConnected && chainId !== MONAD_CHAIN_ID;

  if (!isConnected) {
    return (
      <button
        onClick={() => open({ view: "Connect" })}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-white transition-all"
        style={{
          background:  "linear-gradient(135deg, #7B2FB5, #9B5FD0)",
          fontSize:    compact ? 10 : 12,
          boxShadow:   "0 2px 10px rgba(123,47,181,0.40)",
        }}
      >
        <Wallet style={{ width: compact ? 10 : 12, height: compact ? 10 : 12 }} />
        {compact ? "Conectar" : "Conectar Wallet"}
      </button>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        onClick={() => open({ view: "Networks" })}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all"
        style={{
          background: "#FFF0F0",
          color:      "#E53E3E",
          fontSize:   compact ? 10 : 12,
          border:     "1px solid #FFD5D5",
        }}
      >
        <AlertCircle style={{ width: compact ? 10 : 12, height: compact ? 10 : 12 }} />
        Red incorrecta
      </button>
    );
  }

  const shortAddr = `${address?.slice(0, 6)}…${address?.slice(-4)}`;

  return (
    <button
      onClick={() => open({ view: "Account" })}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all"
      style={{
        background: "rgba(160,255,111,0.15)",
        color:      "#a0ff6f",
        fontSize:   compact ? 10 : 12,
        border:     "1px solid rgba(160,255,111,0.30)",
      }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "#a0ff6f", boxShadow: "0 0 4px #a0ff6f" }} />
      {compact ? shortAddr : `${shortAddr} · MONAD`}
      <ChevronDown style={{ width: compact ? 8 : 10, height: compact ? 8 : 10 }} />
    </button>
  );
}

/* ── Full wallet card for Profile tab ── */
export function WalletCard() {
  const { open }          = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId }       = useAppKitNetwork();

  const wrongNetwork = isConnected && chainId !== MONAD_CHAIN_ID;

  return (
    <div className="card p-4 mb-4" style={{ borderRadius: 20 }}>
      <p className="font-black text-sm mb-3" style={{ color: "#1A1025" }}>🔑 Mi Wallet MONAD</p>

      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-xs mb-3" style={{ color: "#9999AA" }}>
            Conecta tu wallet para firmar alertas on-chain y recibir recompensas
          </p>
          <button
            onClick={() => open({ view: "Connect" })}
            className="btn-primary px-6 py-3 text-sm"
          >
            <span className="flex items-center gap-2 justify-center">
              <Wallet className="w-4 h-4" />
              Conectar Wallet
            </span>
          </button>
        </div>
      ) : wrongNetwork ? (
        <div className="rounded-xl p-3 text-center" style={{ background: "#FFF0F0" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "#E53E3E" }}>
            ⚠️ Cambia a MONAD Testnet
          </p>
          <button
            onClick={() => open({ view: "Networks" })}
            className="text-xs font-black px-4 py-2 rounded-full"
            style={{ background: "#E53E3E", color: "white" }}
          >
            Cambiar red
          </button>
        </div>
      ) : (
        <div>
          {/* Address display */}
          <div className="rounded-xl p-3 mb-3" style={{ background: "#1A0A2E" }}>
            <p className="text-xs mb-1" style={{ color: "#9B6FD0" }}>Dirección</p>
            <p className="font-mono text-xs font-bold" style={{ color: "#a0ff6f" }}>
              {address?.slice(0, 10)}…{address?.slice(-8)}
            </p>
          </div>
          {/* Network badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block"
                style={{ background: "#a0ff6f", boxShadow: "0 0 6px #a0ff6f" }} />
              <span className="text-xs font-bold" style={{ color: "#1A1025" }}>MONAD Testnet</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "#F3E8FB", color: "#7B2FB5" }}>
              Chain ID 41454
            </span>
          </div>
          <button
            onClick={() => open({ view: "Account" })}
            className="btn-ghost w-full text-xs"
          >
            Ver cuenta completa
          </button>
        </div>
      )}
    </div>
  );
}
