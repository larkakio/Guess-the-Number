import { DailyCheckIn } from "@/components/check-in/DailyCheckIn";
import { NeonGuessGame } from "@/components/game/NeonGuessGame";
import { WalletSection } from "@/components/wallet/WalletSection";

export default function Home() {
  return (
    <main className="cyber-root relative flex min-h-dvh flex-col items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,245,255,0.14),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(255,0,170,0.1),transparent_45%),radial-gradient(ellipse_at_20%_80%,rgba(200,255,0,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.55%22/%3E%3C/svg%3E')]" />
      <div className="relative z-[1] flex w-full flex-col items-center pt-4">
        <WalletSection />
        <NeonGuessGame />
        <DailyCheckIn />
      </div>
    </main>
  );
}
