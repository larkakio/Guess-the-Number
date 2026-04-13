"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useConnectors, useDisconnect } from "wagmi";
import { base } from "wagmi/chains";

export function WalletSection() {
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const { connect, isPending, error } = useConnect();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isConnected) setOpen(false);
  }, [isConnected]);

  return (
    <div className="w-full max-w-lg px-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#00f5ff]/25 bg-black/30 px-4 py-3 backdrop-blur-sm">
        <div className="min-w-0 font-mono text-xs text-[#9fb8c9]">
          {status === "connecting" || status === "reconnecting" ? (
            <span className="text-[#c8ff00]">Wallet reconnecting…</span>
          ) : isConnected && address ? (
            <span className="truncate text-[#00f5ff]">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          ) : (
            <span>Not connected</span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {isConnected ? (
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-lg border border-[#ff00aa]/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#ff99dd] hover:bg-[#ff00aa]/10"
            >
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={isPending}
              className="rounded-lg border border-[#c8ff00]/50 bg-[#c8ff00]/10 px-4 py-1.5 font-[family-name:var(--font-display)] text-xs font-semibold tracking-[0.2em] text-[#c8ff00] shadow-[0_0_16px_rgba(200,255,0,0.15)] disabled:opacity-50"
            >
              {isPending ? "…" : "Connect wallet"}
            </button>
          )}
        </div>
      </div>

      {open && !isConnected && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 pb-8 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose wallet"
            className="w-full max-w-md rounded-2xl border border-[#00f5ff]/30 bg-[#070714] p-5 shadow-[0_0_48px_rgba(0,245,255,0.15)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.25em] text-[#e8fbff]">
                Connect
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-xs text-[#9fb8c9] hover:text-[#00f5ff]"
              >
                Close
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      connect({ connector: c, chainId: base.id })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left font-mono text-sm text-[#e8fbff] hover:border-[#00f5ff]/40 hover:bg-[#00f5ff]/5 disabled:opacity-40"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
            {error && (
              <p className="mt-3 font-mono text-xs text-[#ff6699]">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
