"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="mt-2 block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "Déconnexion..." : "🚪 Déconnexion"}
    </button>
  );
}
