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
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-white/60">
          Manage your manga library and track platform activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Total manga</div>
          <div className="mt-2 text-4xl font-bold">{mangaCount}</div>
          <Link
            href="/admin/manga"
            className="mt-4 inline-block text-sm text-red-400 hover:text-red-300"
          >
            View manga list {"->"}
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Total chapters</div>
          <div className="mt-2 text-4xl font-bold">{chapterCount}</div>
          <Link
            href="/admin/chapters"
            className="mt-4 inline-block text-sm text-red-400 hover:text-red-300"
          >
            Manage chapters {"->"}
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Registered users</div>
          <div className="mt-2 text-4xl font-bold">{userCount}</div>
          <div className="mt-4 text-sm text-white/40">
            Premium: {premiumCount} users
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Premium share</div>
          <div className="mt-2 text-4xl font-bold">{premiumPercent}%</div>
          <div className="mt-4 text-sm text-white/40">
            Free: {freeCount} users
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Registered users</h2>
              <p className="mt-1 text-sm text-white/55">
                Newest accounts first, with role and subscription status.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
              {users.length} shown
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
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/75">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-white">
                          {user.email}
                        </div>
                        <div className="mt-1 text-xs text-white/45">
                          Joined {user.createdAt.toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                        Role: {user.role.name}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isPremium
                            ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            : "border border-white/10 bg-white/5 text-white/70"
                        }`}
                      >
                        Plan: {plan}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Premium analytics</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${premiumPercent}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-white/50">Premium users</div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {premiumCount}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-white/50">Free users</div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {freeCount}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Create manga</div>
            <div className="mt-2 text-2xl font-semibold">Add a new title</div>
            <Link
              href="/admin/manga/create"
              className="mt-4 inline-block text-sm text-red-400 hover:text-red-300"
            >
              Create manga {"->"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
