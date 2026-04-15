"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [mode, setMode] = useState<"register" | "login">("register");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Register failed");
      }

      setStatus("Registered. Please login.");
      setRegEmail("");
      setRegPassword("");
    } catch (err: any) {
      setStatus(err?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("manga_token", data.token);
      if (loginEmail === "admin@gmail.com") {
        router.replace("/admin");
      } else {
        router.replace(redirect);
      }
    } catch (err: any) {
      setStatus(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold">Access</h1>
        <p className="text-sm text-white/60 mt-2">
          Register or login to continue.
        </p>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("register")}
              className={`px-4 py-2 rounded-full border text-sm ${
                mode === "register"
                  ? "border-red-400 text-red-300"
                  : "border-white/20 text-white/70"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setMode("login")}
              className={`px-4 py-2 rounded-full border text-sm ${
                mode === "login"
                  ? "border-red-400 text-red-300"
                  : "border-white/20 text-white/70"
              }`}
            >
              Login
            </button>
          </div>

          {mode === "register" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-xs uppercase tracking-wide text-white/50">
                Create account
              </div>
              <div>
                <label className="block text-sm text-white/70">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70">Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-500 hover:bg-red-400 transition px-4 py-2 font-semibold disabled:opacity-60"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-xs uppercase tracking-wide text-white/50">
                Welcome back
              </div>
              <div>
                <label className="block text-sm text-white/70">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70">Password</label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white/10 hover:bg-white/20 transition px-4 py-2 font-semibold disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          )}

          {status && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {status}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
