import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Otaku Vibes – Portez ce qui vous anime",
  description:
    "Otaku Vibes BF : T-shirts, coques, porte-clés, tasses, posters et masques personnalisés inspirés de vos animes préférés.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        <NavBar />
        {children}
        <footer className="border-t border-white/10 bg-[#0a0a0f] px-6 py-10 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Otaku Vibes BF. Tous droits réservés.</p>
          <p className="mt-2">
            Contact : +226 74 72 72 74 · TikTok : @otakuvibesbf · Somgandé vers la SGBF
          </p>
        </footer>
      </body>
    </html>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-black tracking-tight text-white">
            OTAKU <span className="text-red-500">VIBES</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/#articles" className="text-slate-300 hover:text-white">
            Blog
          </Link>
          <Link href="/#temoignages" className="text-slate-300 hover:text-white">
            Témoignages
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full bg-red-600 px-4 py-2 text-white transition hover:bg-red-500"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
