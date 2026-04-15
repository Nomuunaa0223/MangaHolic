"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Subscription = {
  plan: "FREE" | "PREMIUM";
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const params = new URLSearchParams(window.location.search);
      const hasStripeReturn =
        params.get("success") === "1" || params.get("canceled") === "1";
      const token = localStorage.getItem("manga_token");

      if (!token) {
        if (hasStripeReturn) {
          return;
        }

        router.replace("/auth/login?redirect=/subscription");
        return;
      }

      const res = await fetch("/api/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (active) setStatus(err?.error || "Failed to load subscription");
        return;
      }

      const data = await res.json();
      if (active) setSub(data);
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    async function verifyStripeReturn() {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const canceled = params.get("canceled");
      const sessionId = params.get("session_id");

      if (canceled === "1" && active) {
        setStatus("Stripe checkout canceled.");
      }

      if (success !== "1" || !sessionId) {
        return;
      }

      const token = localStorage.getItem("manga_token");

      setCheckingOut(true);
      setStatus("Confirming Stripe payment...");

      const res = await fetch("/api/subscription/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!active) {
        return;
      }

      if (!res.ok) {
        setStatus(data?.error || "Payment verification failed");
        setCheckingOut(false);
        return;
      }

      setSub(data.subscription);
      setStatus("Stripe payment successful. Premium activated.");
      setCheckingOut(false);

      if (!token) {
        localStorage.removeItem("manga_token");
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("canceled");
      url.searchParams.delete("session_id");
      const search = url.searchParams.toString();
      window.history.replaceState({}, "", search ? `${url.pathname}?${search}` : url.pathname);
    }

    verifyStripeReturn();

    return () => {
      active = false;
    };
  }, []);

  async function upgrade() {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      router.replace("/auth/login?redirect=/subscription");
      return;
    }

    setCheckingOut(true);
    setStatus(null);

    const res = await fetch("/api/subscription/upgrade", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus(data?.error || "Unable to start Stripe checkout");
      setCheckingOut(false);
      return;
    }

    if (!data?.url) {
      setStatus("Stripe checkout URL not found");
      setCheckingOut(false);
      return;
    }

    window.location.href = data.url;
  }

  const isPremium = sub?.plan === "PREMIUM";

  return (
    <main className="min-h-screen bg-[#090b10] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            Subscription
          </h1>
          <p className="text-base leading-7 text-white/62 sm:text-lg">
            Manage your plan and unlock full chapters.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,32,0.96)_0%,rgba(11,14,21,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.36)]">
            <div className="border-b border-white/8 px-6 py-6 sm:px-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                Current Plan
              </div>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-[-0.05em] text-white">
                    {sub?.plan || "Loading..."}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/58 sm:text-base">
                    Premium unlocks all chapters and faster access.
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                  {isPremium ? "Active member" : "Upgrade available"}
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:px-8 sm:py-8">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                <div className="text-sm font-semibold text-white/84">
                  Premium benefits
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff4456]" />
                    <span className="text-sm text-white/72">
                      Full chapter access
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff4456]" />
                    <span className="text-sm text-white/72">
                      Premium-only locked chapters
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff4456]" />
                    <span className="text-sm text-white/72">
                      Secure checkout through Stripe
                    </span>
                  </div>
                </div>
              </div>

              {status ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
                  {status}
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,15,22,0.96)_0%,rgba(20,11,17,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.36)]">
            <div className="border-b border-white/8 px-6 py-6 sm:px-8">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                Stripe Checkout
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
                      Premium
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Secure hosted payment page by Stripe.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                      Price
                    </div>
                    <div className="mt-1 text-3xl font-black tracking-[-0.04em] text-white">
                      $4.99
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-white/62">
                  No card inputs here. Stripe opens its own secure checkout page,
                  then sends you back after payment is confirmed.
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
              {!isPremium ? (
                <button
                  onClick={upgrade}
                  disabled={checkingOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff3341] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ff4754] hover:shadow-[0_14px_34px_rgba(255,51,65,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {checkingOut ? "Opening Stripe..." : "Pay with Stripe"}
                  <span aria-hidden="true">{"->"}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white/58"
                >
                  You are Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
