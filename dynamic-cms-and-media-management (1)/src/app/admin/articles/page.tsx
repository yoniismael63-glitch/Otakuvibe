"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/articles?all=true");
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    load();
  }

  async function handleTogglePublish(article: Article) {
    await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !article.published }),
    });
    load();
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Articles</h1>
          <p className="mt-1 text-slate-400">Gérez vos articles de blog</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-500"
        >
          + Nouvel article
        </button>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Chargement...
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Aucun article. Créez le premier !
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14141c]">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Titre</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Catégorie
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Statut
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-slate-500">/{a.slug}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {a.category}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.published
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {a.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(a)}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs transition hover:bg-white/10"
                        title={a.published ? "Dépublier" : "Publier"}
                      >
                        {a.published ? "📝" : "✅"}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(a);
                          setShowForm(true);
                        }}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs transition hover:bg-white/10"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ArticleFormModal
          article={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form Modal
// ---------------------------------------------------------------------------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ArticleFormModal({
  article,
  onClose,
  onSaved,
}: {
  article: Article | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [category, setCategory] = useState(article?.category || "blog");
  const [published, setPublished] = useState(article?.published || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const finalSlug = slug || slugify(title);

    try {
      const url = article ? `/api/articles/${article.id}` : "/api/articles";
      const method = article ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: finalSlug,
          excerpt,
          content,
          coverImage: coverImage || null,
          category,
          published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erreur");
        return;
      }
      onSaved();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {article ? "Modifier l'article" : "Nouvel article"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!article) setSlug(slugify(e.target.value));
              }}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-généré si vide"
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
              >
                <option value="blog">Blog</option>
                <option value="actualites">Actualités</option>
                <option value="evenements">Événements</option>
                <option value="nouveautes">Nouveautés</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm">Publier</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Image de couverture (URL)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... ou /uploads/..."
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Extrait
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Contenu * (HTML autorisé)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 font-mono text-sm outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 font-medium transition hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : article ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
