import Link from "next/link";
import AdminAuthBox from "./_components/AdminAuthBox";
import AdminGuard from "./admin/_components/AdminGuard";

export default function AdminLayout({ children }: any) {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <AdminGuard />
      <div className="flex">
        <aside className="w-64 min-h-screen border-r border-white/10 bg-black/40 p-6">
          <div className="text-lg font-bold mb-8">Admin Panel</div>
          <nav className="space-y-3 text-sm">
            <Link className="block text-white/80 hover:text-white" href="/admin">
              Dashboard
            </Link>
            <Link className="block text-white/80 hover:text-white" href="/admin/manga">
              Manga
            </Link>
            <Link
              className="block text-white/80 hover:text-white"
              href="/admin/manga/create"
            >
              Create Manga
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
      <AdminAuthBox />
    </div>
  );
}
