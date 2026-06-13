import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AdminLogoutButton from "./AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0f]">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#14141c] p-6">
            <div className="mb-6 border-b border-white/10 pb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Connecté
              </p>
              <p className="mt-1 font-bold">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <nav className="space-y-1">
              <SidebarLink href="/admin" label="📊 Tableau de bord" />
              <SidebarLink href="/admin/articles" label="📝 Articles" />
              <SidebarLink href="/admin/testimonials" label="⭐ Témoignages" />
              <SidebarLink href="/admin/media" label="🖼️ Médiathèque" />
            </nav>

            <div className="mt-6 border-t border-white/10 pt-4">
              <Link
                href="/"
                className="block rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                ← Voir le site
              </Link>
              <AdminLogoutButton />
            </div>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#14141c] md:hidden">
          <div className="flex justify-around px-2 py-2">
            <MobileNavLink href="/admin" label="📊" />
            <MobileNavLink href="/admin/articles" label="📝" />
            <MobileNavLink href="/admin/testimonials" label="⭐" />
            <MobileNavLink href="/admin/media" label="🖼️" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pb-20 md:pb-0">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-2 text-xl text-slate-400"
    >
      {label}
    </Link>
  );
}
