import type { Metadata } from "next";
import { Orbitron, DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { NetworkBanner } from "@/components/NetworkBanner";
import { Providers } from "@/components/providers";
import { config } from "@/lib/wagmi-config";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const bodySans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

/** Fallbacks match production Vercel + Base dashboard so meta verifies if env is missing in CI. */
const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69dcab4bed56423f0cd3e6ea";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://guess-the-number-self-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Neon Cipher — Guess the Number",
  description:
    "Cyberpunk number puzzle on Base. Swipe to tune your guess, commit, and check in on-chain.",
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "Neon Cipher — Guess the Number",
    description: "Mobile-first guess game on Base with daily check-in.",
    images: ["/thumbnail.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie");
  const initialState = cookieToInitialState(config, cookieHeader ?? undefined);

  return (
    <html lang="en" className={`${display.variable} ${bodySans.variable}`}>
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="min-h-dvh font-[family-name:var(--font-body)] antialiased">
        <Providers initialState={initialState}>
          <NetworkBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
