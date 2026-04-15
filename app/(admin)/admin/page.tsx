import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [mangaCount, chapterCount, userCount, premiumCount, users] =
    await Promise.all([
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.user.count(),
      prisma.subscription.count({
        where: { plan: "PREMIUM" },
      }),
      prisma.user.findMany({
        include: {
          role: true,
          subscription: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

  const freeCount = Math.max(userCount - premiumCount, 0);
  const premiumPercent =
    userCount === 0 ? 0 : Math.round((premiumCount / userCount) * 100);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,11,18,0.96)_0%,rgba(17,10,18,0.98)_100%)] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,92,111,0.18),transparent_32%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_24%)]" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-red-300/20 bg-red-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-red-100">
              Admin Overview
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Track your manga library, registered users, and premium conversion
              from a single place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Manga
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {mangaCount}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Users
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {userCount}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Premium
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {premiumPercent}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="text-sm text-white/55">Total manga</div>
          <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
            {mangaCount}
          </div>
          <Link
            href="/admin/manga"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-red-300 transition hover:text-red-200"
          >
            View manga list {"->"}
          </Link>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="text-sm text-white/55">Total chapters</div>
          <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
            {chapterCount}
          </div>
          <Link
            href="/admin/chapters"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-red-300 transition hover:text-red-200"
          >
            Manage chapters {"->"}
          </Link>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="text-sm text-white/55">Registered users</div>
          <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
            {userCount}
          </div>
          <div className="mt-5 text-sm text-white/42">
            Premium users: {premiumCount}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="text-sm text-white/55">Create manga</div>
          <div className="mt-3 text-2xl font-bold tracking-[-0.03em] text-white">
            Add a new title
          </div>
          <Link
            href="/admin/manga/create"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-red-300 transition hover:text-red-200"
          >
            Create manga {"->"}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,21,30,0.96)_0%,rgba(11,14,20,0.98)_100%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Registered users</h2>
              <p className="mt-1 text-sm text-white/55">
                Newest accounts first with role and subscription status.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70">
              Showing {users.length}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {users.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/55">
                No registered users yet.
              </div>
            ) : (
              users.map((user, index) => {
                const plan = user.subscription?.plan ?? "FREE";
                const isPremium = plan === "PREMIUM";

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4 transition hover:border-white/15 hover:bg-white/[0.06] lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-sm font-bold text-white/78">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-white">
                          {user.email}
                        </div>
                        <div className="mt-1 text-xs text-white/42">
                          Joined {user.createdAt.toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/72">
                        {user.role.name}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          isPremium
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.05] text-white/72"
                        }`}
                      >
                        {plan}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,14,23,0.96)_0%,rgba(13,11,18,0.98)_100%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] sm:p-7">
            <div className="text-sm text-white/55">Premium analytics</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff3341]"
                style={{ width: `${premiumPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/55">
              <span>Premium conversion</span>
              <span>{premiumPercent}%</span>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/50">Premium users</div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {premiumCount}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/50">Free users</div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {freeCount}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-7">
            <div className="text-sm text-white/55">Quick action</div>
            <div className="mt-3 text-2xl font-bold tracking-[-0.03em] text-white">
              Create a new manga
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Add a new title, then jump straight into chapter management.
            </p>
            <Link
              href="/admin/manga/create"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#ff3341] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ff4754] hover:shadow-[0_14px_34px_rgba(255,51,65,0.35)]"
            >
              Create manga {"->"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
