"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: "image" | "video";
  alt: string | null;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/media");
    if (res.ok) {
      const data = await res.json();
      setItems(data.media);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.message || `Erreur: ${file.name}`);
      }
    }

    setUploading(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce fichier ?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    load();
  }

  function copyUrl(url: string) {
    const full = window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Médiathèque</h1>
        <p className="mt-1 text-slate-400">
          Uploadez et gérez vos images et vidéos
        </p>
      </header>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        className={`mb-8 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragActive
            ? "border-red-500 bg-red-500/10"
            : "border-white/20 bg-[#14141c] hover:border-white/40"
        }`}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="text-5xl">{uploading ? "⏳" : "📤"}</div>
        <p className="mt-4 font-semibold">
          {uploading ? "Envoi en cours..." : "Cliquez ou glissez-déposez"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Images (JPG, PNG, GIF, WebP, SVG) et vidéos (MP4, WebM) — Max 50 Mo
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {uploadError}
        </div>
      )}

      {/* Gallery */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Chargement...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141c] p-10 text-center text-slate-400">
          Aucun fichier uploadé pour le moment
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#14141c]"
            >
              <div className="relative aspect-video bg-black">
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                  />
                )}
                <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold">
                  {item.type === "image" ? "🖼️" : "🎬"}
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/30"
                    title="Copier l'URL"
                  >
                    {copiedUrl === item.url ? "✓ Copié" : "📋"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="text-xs text-slate-500">{formatSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
