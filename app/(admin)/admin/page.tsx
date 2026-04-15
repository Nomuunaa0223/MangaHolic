import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [mangaCount, chapterCount, userCount] = await Promise.all([
    prisma.manga.count(),
    prisma.chapter.count(),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-white/60 mt-2">Manage your manga library and content.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Нийт манга</div>
          <div className="text-4xl font-bold mt-2">{mangaCount}</div>
          <Link href="/admin/manga" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
            Жагсаалт харах →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Нийт бүлэг</div>
          <div className="text-4xl font-bold mt-2">{chapterCount}</div>
          <Link href="/admin/chapters" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
            Бүлгүүд харах →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Нийт хэрэглэгч</div>
          <div className="text-4xl font-bold mt-2">{userCount}</div>
          <span className="mt-4 inline-block text-sm text-white/40">Бүртгэлтэй нийт</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Шинэ манга</div>
          <div className="text-2xl font-semibold mt-2">Нэмэх</div>
          <Link href="/admin/manga/create" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
            Манга үүсгэх →
          </Link>
        </div>
      </div>
    </div>
  );
}
