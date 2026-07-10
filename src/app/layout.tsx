import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EMBER — every abandoned passion still glows",
  description:
    "Your abandoned passions get a voice. Confess what you quit, talk to it, then rekindle it or lay it to rest — on-chain, forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5 text-sm">
          <Link href="/" className="font-display text-lg tracking-wide text-amber-400">
            <span className="ember-dot mr-2 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle" />
            EMBER
          </Link>
          <div className="flex gap-6 text-stone-400">
            <Link href="/session" className="hover:text-amber-300">Begin</Link>
            <Link href="/atlas" className="hover:text-amber-300">The Atlas</Link>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="mx-auto w-full max-w-4xl px-6 py-10 text-center text-xs text-stone-600">
          Built for the DEV Weekend Challenge: Passion Edition · Gemini · ElevenLabs · Snowflake · Solana
        </footer>
      </body>
    </html>
  );
}
