import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Silver",
  description: "Modern Silver Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-[var(--background)] text-[var(--foreground)] bg-motion-page">
        <div className="motion-page-layer">
          <div className="motion-blob motion-blob--emerald motion-blob--top-left" />
          <div className="motion-blob motion-blob--silver motion-blob--bottom-right motion-blob--delay" />
        </div>

        <nav className="z-10 border-b border-[var(--card-border)] bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-zinc-700"
            >
              Customer Portal
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-black transition hover:-translate-y-px hover:opacity-90 btn-motion-emerald"
            >
              Admin Dashboard
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
