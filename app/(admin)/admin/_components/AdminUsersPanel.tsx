"use client";

import { useState } from "react";

type AdminUser = {
  id: number;
  email: string;
  roleName: string;
  plan: string;
  joinedAt: string;
};

type AdminUsersPanelProps = {
  userCount: number;
  premiumCount: number;
  users: AdminUser[];
};

export default function AdminUsersPanel({
  userCount,
  premiumCount,
  users,
}: AdminUsersPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5 md:col-span-2 xl:col-span-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-left shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition hover:border-white/20 hover:bg-white/[0.06]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/55">Registered users</div>
            <div className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
              {userCount}
            </div>
            <div className="mt-5 text-sm text-white/42">
              Premium users: {premiumCount}
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
            {open ? "Hide" : "View"}
          </div>
        </div>
      </button>

      {open ? (
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
                const isPremium = user.plan === "PREMIUM";

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
                          Joined {user.joinedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/72">
                        {user.roleName}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          isPremium
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.05] text-white/72"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
