import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const OG_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_318C23nPR0PT9UTOdpsLk2Xj8ig/hf_20260710_042119_8f518ebb-cb3b-4e62-ba4a-33106625104d.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://ember-himanshus-projects-acd54afd.vercel.app"),
  title: "EMBER — every abandoned passion still glows",
  description:
    "Your abandoned passions get a voice. Confess what you quit, talk to it, then rekindle it or lay it to rest — on-chain, forever.",
  openGraph: {
    title: "EMBER — every abandoned passion still glows",
    description:
      "The guitar in your closet has something to say. Confess, converse, then rekindle or lay to rest.",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="atmosphere flex min-h-full flex-col">
        <nav className="sticky top-0 z-40 border-b border-stone-800/60 bg-stone-950/70 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4 text-sm">
            <Link
              href="/"
              className="font-display flex items-center gap-2.5 text-lg tracking-[0.18em] text-amber-400"
            >
              <span aria-hidden className="ember-dot inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_14px_4px_rgba(245,158,11,0.45)]" />
              EMBER
            </Link>
            <div className="flex items-center gap-1 text-stone-400">
              <Link href="/session" className="rounded-full px-4 py-2 transition-colors hover:bg-stone-900 hover:text-amber-300">
                Begin
              </Link>
              <Link href="/atlas" className="rounded-full px-4 py-2 transition-colors hover:bg-stone-900 hover:text-amber-300">
                The Atlas
              </Link>
            </div>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-stone-800/60">
          <div className="mx-auto w-full max-w-4xl px-6 py-10 text-center">
            <p className="font-display text-sm italic text-stone-500">
              “There is a closet like yours in every house on earth.”
            </p>
            <p className="mt-3 text-xs tracking-wide text-stone-600">
              Built for the DEV Weekend Challenge: Passion Edition · Gemini · ElevenLabs · Snowflake · Solana
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
