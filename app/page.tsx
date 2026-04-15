import Link from "next/link";
import HomeAuthButton from "./_components/HomeAuthButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let mangaList: Array<{
    id: number;
    title: string;
    _count: { chapters: number };
  }> = [];

  let loadError = false;

  try {
    mangaList = await prisma.manga.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { chapters: true } } },
    });
  } catch (error) {
    loadError = true;
    console.error("Failed to load manga list", error);
  }

  const featured = mangaList[0] ?? null;

  return (
    <main className="min-h-screen bg-[#1b1b1b] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(255,0,90,0.25),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(0,200,255,0.2),_transparent_50%)]" />

        <nav className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 font-black">
              MH
            </div>
            <span className="text-xl font-bold tracking-tight">MangaHolic</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/subscription"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-white/40"
            >
              Subscription
            </Link>
            <HomeAuthButton />
          </div>
        </nav>

        <section className="relative z-10 px-8 py-10">
          {loadError ? (
            <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
              Database holbolt aldaatai baina. Neon/Vercel env-aa shalgasny daraa content dahin garna.
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="relative isolate flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(43,10,18,0.98)_0%,rgba(28,8,16,0.97)_58%,rgba(18,6,13,0.98)_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,87,99,0.2),transparent_34%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_28%)]" />
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full border border-white/10 bg-white/5 blur-2xl" />

              <div className="relative">
                <div className="inline-flex items-center rounded-full border border-red-300/30 bg-[#ff3341] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(255,51,65,0.35)]">
                  Latest Release
                </div>

                <h2 className="mt-6 max-w-[9ch] text-4xl font-black leading-[0.92] tracking-[-0.04em] text-white sm:text-5xl">
                  {featured?.title ?? "Manga"}
                </h2>

                <p className="mt-3 max-w-xs text-sm leading-6 text-white/68 sm:text-base">
                  Featured series with the newest chapters ready to open
                  instantly.
                </p>
              </div>

              <div className="relative mt-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Chapters
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white flex items-center">
                      {featured?._count?.chapters ?? 0}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Status
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      New Drop
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  {featured ? (
                    <Link
                      href={`/manga/${featured.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#ff3341] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ff4754] hover:shadow-[0_14px_34px_rgba(255,51,65,0.35)]"
                    >
                      Read Now
                      <span aria-hidden="true">{"->"}</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-emerald-300/60 via-fuchsia-500/40 to-slate-900/80 p-6">
              <div
                className="flex h-[320px] w-full items-end justify-end rounded-2xl border border-white/10 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://jumpg-assets.tokyo-cdn.com/secure/title/100171/title_thumbnail_main/312232.jpg?hash=m_vhLi3GSUNLHNXwv1XUpA&expires=2145884400')",
                }}
              >
                <div className="m-6 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold">
                  FEATURED HERO
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {mangaList.map((m, index) => (
              <Link
                key={m.id}
                href={`/manga/${m.id}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 transition hover:border-white/30"
              >
                <div className="h-28 bg-gradient-to-br from-orange-500/70 via-red-500/50 to-slate-900/70" />
                <div className="p-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">
                    {m._count.chapters} 
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">
                    {index + 1}. {m.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
