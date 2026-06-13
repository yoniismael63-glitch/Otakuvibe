import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  if (!article || !article.published) {
    notFound();
  }

  return (
    <main className="px-6 py-12">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/#articles"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          ← Retour aux articles
        </Link>

        <div className="mb-4">
          <span className="text-sm font-semibold uppercase tracking-widest text-red-400">
            {article.category}
          </span>
          <span className="mx-2 text-slate-600">•</span>
          <span className="text-sm text-slate-500">
            {new Date(article.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">
          {article.title}
        </h1>

        {article.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {article.excerpt && (
          <p className="mb-8 rounded-xl border-l-4 border-red-500 bg-[#14141c] p-6 text-lg italic text-slate-300">
            {article.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-red-400 prose-strong:text-white prose-code:text-red-300"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </main>
  );
}
