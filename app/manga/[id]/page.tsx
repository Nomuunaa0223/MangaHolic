"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Chapter = { id: number; title: string; order: number };
type Manga = { id: number; title: string; chapters?: Chapter[] };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const token = localStorage.getItem("manga_token");
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const res = await fetch(`/api/manga/${id}`, { headers });
        const data = await res.json();
        if (active) setManga(data);
      } catch {
        if (active) setError("Failed to load manga");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  function openChapter(chapterId: number) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      router.push(`/auth/login?redirect=/chapter/${chapterId}`);
      return;
    }
    router.push(`/chapter/${chapterId}`);
  }

  const chapterCount = manga?.chapters?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,68,87,0.16),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(76,145,255,0.10),transparent_36%)]" />

        <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              <span aria-hidden="true">{"<-"}</span>
              <span>Back</span>
            </Link>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                Manga Detail
              </div>
              <h1 className="truncate text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                {manga?.title ?? "..."}
              </h1>
            </div>
          </div>
        </header>

        <section className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-white/60 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-8 text-red-300 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              {error}
            </div>
          ) : !manga?.chapters?.length ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-white/55 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              No chapters yet.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,21,31,0.96)_0%,rgba(12,15,23,0.98)_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
                <div className="border-b border-white/8 px-6 py-6 sm:px-8">
                  <div className="inline-flex items-center rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-200">
                    Series Overview
                  </div>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                        {manga.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/62 sm:text-base">
                        Clean chapter flow with a sharper reading list and
                        stronger visual hierarchy.
                      </p>
                    </div>
                    <div className="inline-flex min-w-[132px] flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-sm">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                        Chapters
                      </span>
                      <span className="mt-1 text-2xl font-bold text-white">
                        {chapterCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
                  {manga.chapters.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openChapter(c.id)}
                      className="group flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] px-5 py-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-red-400/25 hover:bg-[linear-gradient(90deg,rgba(255,65,84,0.10),rgba(255,255,255,0.04))] hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-bold text-white/72">
                          #{c.order}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                            Chapter
                          </div>
                          <div className="truncate text-lg font-semibold text-white">
                            {c.title}
                          </div>
                        </div>
                      </div>

                      <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/55 transition group-hover:border-red-300/20 group-hover:bg-red-500/10 group-hover:text-red-100 sm:inline-flex">
                        <span>Read</span>
                        <span aria-hidden="true">{"->"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
