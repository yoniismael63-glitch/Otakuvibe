"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  id: number;
  clientName: string;
  clientRole: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  featured: boolean;
  createdAt: string;
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/testimonials?all=true");
    if (res.ok) {
      const data = await res.json();
      setItems(data.testimonials);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Témoignages</h1>
          <p className="mt-1 text-slate-400">
            Gérez les avis et références clients
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-500"
        >
          + Nouveau témoignage
        </button>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Chargement...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Aucun témoignage pour le moment
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#14141c] p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-lg font-bold">
                {t.clientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{t.clientName}</p>
                  {t.featured && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                      ⭐ Vedette
                    </span>
                  )}
                  <span className="text-yellow-400">
                    {"★".repeat(t.rating)}
                    <span className="text-slate-700">
                      {"★".repeat(5 - t.rating)}
                    </span>
                  </span>
                </div>
                {(t.clientRole || t.company) && (
                  <p className="text-xs text-slate-500">
                    {t.clientRole}
                    {t.clientRole && t.company ? " — " : ""}
                    {t.company}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-300">{t.content}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    setEditing(t);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-white/10 px-3 py-1 text-sm transition hover:bg-white/10"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-lg border border-red-500/20 px-3 py-1 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TestimonialFormModal
          testimonial={editing}
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

function TestimonialFormModal({
  testimonial,
  onClose,
  onSaved,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clientName, setClientName] = useState(testimonial?.clientName || "");
  const [clientRole, setClientRole] = useState(testimonial?.clientRole || "");
  const [company, setCompany] = useState(testimonial?.company || "");
  const [content, setContent] = useState(testimonial?.content || "");
  const [rating, setRating] = useState(testimonial?.rating || 5);
  const [avatar, setAvatar] = useState(testimonial?.avatar || "");
  const [featured, setFeatured] = useState(testimonial?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = testimonial
        ? `/api/testimonials/${testimonial.id}`
        : "/api/testimonials";
      const method = testimonial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientRole: clientRole || null,
          company: company || null,
          content,
          rating,
          avatar: avatar || null,
          featured,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
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
        className="my-8 w-full max-w-lg rounded-2xl border border-white/10 bg-[#14141c] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {testimonial ? "Modifier" : "Nouveau témoignage"}
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
            <label className="mb-1 block text-sm font-medium">Nom du client *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Rôle</label>
              <input
                type="text"
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                placeholder="Ex: Client fidèle"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Entreprise</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl transition ${
                    n <= rating ? "text-yellow-400" : "text-slate-700"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Avatar (URL)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0a0a0f] px-4 py-2.5 outline-none focus:border-red-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Mettre en vedette</span>
          </label>

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
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
