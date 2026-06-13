import { db } from "@/db";
import { articles, testimonials, media, users } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalArticles,
    publishedArticles,
    totalTestimonials,
    totalMedia,
    recentArticles,
    recentTestimonials,
  ] = await Promise.all([
    db.select({ count: count() }).from(articles),
    db.select({ count: count() }).from(articles).where(eq(articles.published, true)),
    db.select({ count: count() }).from(testimonials),
    db.select({ count: count() }).from(media),
    db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(5),
    db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt))
      .limit(5),
  ]);

  const stats = [
    {
      label: "Articles",
      value: totalArticles[0].count,
      sub: `${publishedArticles[0].count} publiés`,
      href: "/admin/articles",
      emoji: "📝",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Témoignages",
      value: totalTestimonials[0].count,
      sub: "avis clients",
      href: "/admin/testimonials",
      emoji: "⭐",
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Média",
      value: totalMedia[0].count,
      sub: "images & vidéos",
      href: "/admin/media",
      emoji: "🖼️",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-slate-400">
          Bienvenue dans l'administration de votre site
        </p>
      </header>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#14141c] p-6 transition hover:border-white/20"
          >
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-20 transition group-hover:opacity-40`}
            />
            <div className="relative">
              <div className="text-3xl">{s.emoji}</div>
              <p className="mt-3 text-4xl font-black">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-white">{s.label}</p>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Articles récents</h2>
            <Link
              href="/admin/articles"
              className="text-sm text-red-400 hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun article pour le moment
            </p>
          ) : (
            <ul className="space-y-3">
              {recentArticles.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">📰</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      {a.published ? "✅ Publié" : "📝 Brouillon"} ·{" "}
                      {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Témoignages récents</h2>
            <Link
              href="/admin/testimonials"
              className="text-sm text-red-400 hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {recentTestimonials.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun témoignage pour le moment
            </p>
          ) : (
            <ul className="space-y-3">
              {recentTestimonials.map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-sm font-bold">
                    {t.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.clientName}</p>
                    <p className="truncate text-xs text-slate-500">{t.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
