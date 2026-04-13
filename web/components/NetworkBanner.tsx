"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();

  if (!isConnected || chainId === base.id) return null;

  return (
    <div className="sticky top-0 z-[70] flex items-center justify-center gap-3 border-b border-[#ff00aa]/35 bg-[#1a0518]/95 px-4 py-2 backdrop-blur-md">
      <p className="font-mono text-[11px] text-[#ffccdd]">
        Network is not Base — switch to sign transactions on Base L2.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => void switchChainAsync({ chainId: base.id })}
        className="shrink-0 rounded-lg border border-[#00f5ff]/50 bg-[#00f5ff]/15 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-[#00f5ff] disabled:opacity-50"
      >
        {isPending ? "…" : "Switch to Base"}
      </button>
    </div>
  );
}
