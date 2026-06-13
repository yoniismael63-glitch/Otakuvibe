import Link from "next/link";
import { db } from "@/db";
import { articles, testimonials } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [publishedArticles, allTestimonials] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(6),
    db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.featured), desc(testimonials.createdAt))
      .limit(8),
  ]);

  return (
    <main>
      {/* ====================================================================
          HERO
          ==================================================================== */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        {/* Background radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-300">
            <span className="text-lg">🔥</span>
            <span className="font-semibold">OTAKU VIBES BF</span>
          </div>
          <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight">
            PORTEZ CE QUI VOUS{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-red-600 bg-clip-text text-transparent">
              ANIME
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            T-shirts, coques de téléphone, porte-clés, tasses, posters, tableaux
            et masques personnalisés aux couleurs de vos animes préférés.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.tiktok.com/@otakuvibesbf"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-red-600 px-8 py-3 font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
            >
              Découvrir nos produits
            </a>
            <a
              href="#temoignages"
              className="rounded-full border border-white/20 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Témoignages clients
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MARQUEE
          ==================================================================== */}
      <div className="overflow-hidden border-y border-white/10 bg-red-600/10 py-4">
        <div className="animate-marquee flex whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-8 px-4 text-sm font-semibold text-red-200">
              <span>⚔️ NARUTO</span>
              <span>🏴‍☠️ ONE PIECE</span>
              <span>👹 DEMON SLAYER</span>
              <span>🔮 JUJUTSU KAISEN</span>
              <span>⚡ ATTACK ON TITAN</span>
              <span>🎴 DRAGON BALL</span>
              <span>🦊 BLEACH</span>
              <span>👾 MY HERO ACADEMIA</span>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          PRODUCTS PREVIEW
          ==================================================================== */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Nos Articles
            </h2>
            <p className="mt-3 text-slate-400">
              Des créations uniques faites par des passionnés, pour des passionnés.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "👕", label: "T-shirts", desc: "Impressions haute qualité sur coton premium" },
              { emoji: "📱", label: "Coques", desc: "Protection & style pour tous les modèles" },
              { emoji: "🔑", label: "Porte-clés", desc: "Accessoires du quotidien à l'effigie de vos héros" },
              { emoji: "☕", label: "Tasses", desc: "Céramique résistante, impressions durables" },
              { emoji: "🖼️", label: "Posters & Tableaux", desc: "Art mural pour décorer votre espace" },
              { emoji: "😷", label: "Masques", desc: "Tissus confortables aux motifs originaux" },
            ].map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-white/10 bg-[#14141c] p-6 transition hover:border-red-500/50 hover:bg-[#1a1a25]"
              >
                <div className="mb-4 text-5xl transition group-hover:scale-110">
                  {item.emoji}
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.label}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          TESTIMONIALS
          ==================================================================== */}
      <section id="temoignages" className="border-t border-white/10 bg-[#0d0d14] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Nos clients parlent de nous
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Témoignages
            </h2>
          </div>

          {allTestimonials.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
              Aucun témoignage pour le moment. Revenez bientôt !
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="relative flex flex-col rounded-2xl border border-white/10 bg-[#14141c] p-6 transition hover:border-red-500/30"
                >
                  {t.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white">
                      ⭐ Vedette
                    </span>
                  )}
                  <div className="mb-3 flex text-yellow-400">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="flex-1 text-slate-300">&ldquo;{t.content}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 font-bold text-white">
                      {t.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{t.clientName}</p>
                      <p className="text-xs text-slate-500">
                        {t.clientRole || "Client satisfait"}
                        {t.company ? ` — ${t.company}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          ARTICLES / BLOG
          ==================================================================== */}
      <section id="articles" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-red-400">
                Blog & Actualités
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                Derniers Articles
              </h2>
            </div>
          </div>

          {publishedArticles.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
              Aucun article publié pour le moment.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#14141c] transition hover:border-red-500/50"
                >
                  {article.coverImage ? (
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-red-900/40 to-[#14141c] text-6xl">
                      📰
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                      {article.category}
                    </span>
                    <h3 className="mt-2 text-xl font-bold leading-tight group-hover:text-red-400">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                        {article.excerpt}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-slate-500">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          CONTACT / CTA
          ==================================================================== */}
      <section className="border-t border-white/10 bg-[#0d0d14] px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-600/20 via-[#14141c] to-[#14141c] p-10 text-center md:p-16">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            Contactez-nous
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Une commande personnalisée, une question ou une collaboration ?
            Notre équipe vous répond rapidement !
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <a
              href="tel:+22674727274"
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold shadow-lg shadow-red-600/30 transition hover:bg-red-500"
            >
              📞 +226 74 72 72 74
            </a>
            <a
              href="https://www.tiktok.com/@otakuvibesbf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              🎵 TikTok : @otakuvibesbf
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            📍 Somgandé vers la SGBF
          </p>
        </div>
      </section>
    </main>
  );
}
