import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Loadoutry", template: "%s · Loadoutry" },
  description: "Build guides that explain the math. Starting with Crimson Desert.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <header className="glass sticky top-0 z-40 border-b border-hairline">
          <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 text-[13px]">
            <Link href="/" className="font-semibold tracking-tight text-[15px]">Loadoutry</Link>
            <div className="flex items-center gap-6 text-ink-2">
              <Link href="/crimson-desert/" className="hover:text-ink">Crimson Desert</Link>
              <Link href="/guild-wars-2/" className="hover:text-ink">Guild Wars 2</Link>
              <Link href="/crimson-desert/mechanics/" className="hover:text-ink">Mechanics</Link>
              <a href="https://github.com/nishnash07/loadoutry" className="hover:text-ink">GitHub</a>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-5 py-8 text-[12px] text-ink-2 leading-relaxed">
            <p>Loadoutry is a fan project. Game names, item names and icons belong to their publishers; Crimson Desert is © Pearl Abyss, Guild Wars 2 is © ArenaNet (data via the official API). Numbers come from datamined item tables and the game&apos;s own status table; community-tested rules are marked as such.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
