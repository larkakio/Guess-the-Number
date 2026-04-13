"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { getBuilderDataSuffix } from "@/lib/builder-suffix";
import { checkInAbi, getCheckInContractAddress } from "@/lib/contracts/check-in";

export function DailyCheckIn() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [err, setErr] = useState<string | null>(null);

  const contractAddress = useMemo(() => getCheckInContractAddress(), []);

  const { data: onchainDay } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "currentDay",
    query: { enabled: !!contractAddress },
  });

  const { data: lastDay, refetch: refetchLast } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "lastCheckDay",
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address },
  });

  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: contractAddress,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address },
  });

  const wrongNetwork = isConnected && chainId !== base.id;
  const maxUint = BigInt(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  );
  const alreadyToday =
    onchainDay !== undefined &&
    lastDay !== undefined &&
    lastDay !== maxUint &&
    lastDay === onchainDay;

  const onCheckIn = useCallback(async () => {
    setErr(null);
    if (!contractAddress) {
      setErr("Contract address not configured.");
      return;
    }
    if (!address) {
      setErr("Connect a wallet first.");
      return;
    }
    try {
      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      const dataSuffix = getBuilderDataSuffix();
      await writeContractAsync({
        address: contractAddress,
        abi: checkInAbi,
        functionName: "checkIn",
        chainId: base.id,
        ...(dataSuffix ? { dataSuffix } : {}),
      });
      await refetchLast();
      await refetchStreak();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed.";
      setErr(msg);
    }
  }, [
    address,
    chainId,
    contractAddress,
    refetchLast,
    refetchStreak,
    switchChainAsync,
    writeContractAsync,
  ]);

  if (!contractAddress) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-6">
        <p className="rounded-xl border border-[#ff00aa]/25 bg-black/30 px-4 py-3 font-mono text-xs text-[#9fb8c9]">
          Daily check-in will be available after{" "}
          <code className="text-[#00f5ff]">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
          is set.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8">
      <div className="rounded-2xl border border-[#c8ff00]/20 bg-[linear-gradient(135deg,rgba(8,12,28,0.9),rgba(18,6,24,0.85))] p-4 shadow-[inset_0_0_40px_rgba(200,255,0,0.04)]">
        <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] text-[#c8ff00]/90">
          ON-CHAIN CHECK-IN · BASE
        </p>
        <p className="mt-1 font-mono text-[11px] text-[#9fb8c9]">
          Once per UTC day. You only pay L2 gas — no fee to the contract.
        </p>
        {isConnected && (
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] text-[#00f5ff]/90">
            <span>Streak: {streak?.toString() ?? "—"}</span>
            {alreadyToday && (
              <span className="text-[#c8ff00]">Checked in today</span>
            )}
          </div>
        )}
        {wrongNetwork && (
          <p className="mt-3 rounded-lg border border-[#ff00aa]/35 bg-[#ff00aa]/10 px-3 py-2 font-mono text-xs text-[#ff99dd]">
            Wrong network — switch to Base before check-in.
          </p>
        )}
        {err && (
          <p className="mt-3 font-mono text-xs text-[#ff6699]">{err}</p>
        )}
        <button
          type="button"
          disabled={
            !isConnected ||
            alreadyToday ||
            isWriting ||
            isSwitching
          }
          onClick={() => void onCheckIn()}
          className="mt-4 w-full rounded-xl border border-[#00f5ff]/45 bg-[#00f5ff]/10 py-3 font-[family-name:var(--font-display)] text-xs font-semibold tracking-[0.25em] text-[#e8fbff] shadow-[0_0_24px_rgba(0,245,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {alreadyToday
            ? "ALREADY CHECKED IN"
            : isWriting || isSwitching
              ? "CONFIRM IN WALLET…"
              : "DAILY CHECK-IN"}
        </button>
      </div>
    </div>
  );
}
