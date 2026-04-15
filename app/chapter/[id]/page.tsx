"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Chapter = {
  id: number;
  title: string;
  content: string;
  mangaId: number;
  order: number;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const token = localStorage.getItem("manga_token");
      if (!token) {
        router.replace(`/auth/login?redirect=/chapter/${id}`);
        return;
      }

      try {
        const res = await fetch(`/api/chapters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          if (active) setError(data?.error || "Something went wrong");
          return;
        }

        if (active) setChapter(data);
      } catch {
        if (active) setError("Failed to load chapter");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id, router]);

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,80,98,0.14),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(78,145,255,0.10),transparent_34%)]" />

        <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-5 sm:px-8">
            <button
              onClick={() =>
                chapter ? router.push(`/manga/${chapter.mangaId}`) : router.push("/")
              }
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
            >
              <span aria-hidden="true">{"<-"}</span>
              <span>Back</span>
            </button>

            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">
                Reader View
              </div>
              <h1 className="truncate text-xl font-black tracking-[-0.04em] text-white sm:text-2xl">
                {chapter?.title ?? "..."}
              </h1>
            </div>
          </div>
        </header>

        <section className="relative mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-white/60 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              Loading chapter...
            </div>
          ) : error === "Upgrade required" ? (
            <div className="rounded-[32px] border border-red-400/15 bg-[linear-gradient(180deg,rgba(34,10,17,0.98)_0%,rgba(20,8,14,0.98)_100%)] px-8 py-14 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-300/20 bg-red-500/12 text-2xl text-red-200">
                Lock
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-white">
                Premium Chapter
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65 sm:text-base">
                Upgrade your plan to unlock this chapter and continue reading
                without limits.
              </p>
              <Link
                href="/subscription"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#ff3341] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ff4754] hover:shadow-[0_14px_34px_rgba(255,51,65,0.35)]"
              >
                Upgrade
                <span aria-hidden="true">{"->"}</span>
              </Link>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-8 text-red-300 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              {error}
            </div>
          ) : (
            <article className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,32,0.96)_0%,rgba(11,14,21,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.36)]">
              <div className="border-b border-white/8 px-6 py-6 sm:px-8 sm:py-7">
                <div className="inline-flex items-center rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-200">
                  Chapter {chapter?.order ?? "-"}
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                  {chapter?.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                  Focused reading layout with cleaner spacing and a softer
                  contrast for long-form content.
                </p>
              </div>

              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-2xl text-[17px] leading-9 whitespace-pre-wrap text-white/84 sm:text-[18px] sm:leading-10">
                  {chapter?.content}
                </div>
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
