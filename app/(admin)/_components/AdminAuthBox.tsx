"use client";

import { useState, useEffect } from "react";

function parseToken(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function AdminAuthBox() {
  const [open, setOpen] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [me, setMe] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("manga_token");
    if (!token) return;
    const payload = parseToken(token);
    if (!payload) return;
    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) setMe({ email: data.email, role: data.role?.name });
      })
      .catch(() => {});
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, password: regPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Register failed");
      return;
    }

    setStatus("Registered. Please login.");
    setRegEmail("");
    setRegPassword("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Login failed");
      return;
    }

    const data = await res.json();
    localStorage.setItem("manga_token", data.token);
    const payload = parseToken(data.token);
    if (payload) {
      fetch("/api/users/me", { headers: { Authorization: `Bearer ${data.token}` } })
        .then((r) => r.json())
        .then((u) => { if (u?.email) setMe({ email: u.email, role: u.role?.name }); })
        .catch(() => {});
    }
    setStatus("Logged in");
    window.location.href = "/";
  }

  function logout() {
    localStorage.removeItem("manga_token");
    setMe(null);
    setStatus("Logged out");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs text-white/80 hover:text-white hover:border-white/40 transition"
      >
        {me ? me.email : "Login"}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-72 rounded-2xl border border-white/10 bg-black/70 p-4 text-sm text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Admin Access</div>
        <button onClick={() => setOpen(false)} className="text-xs text-white/60 hover:text-white">Close</button>
      </div>

      {me && (
        <div className="mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs">
          <div className="text-white/50">Нэвтэрсэн</div>
          <div className="font-semibold mt-0.5">{me.email}</div>
          <div className={`mt-0.5 ${me.role === "ADMIN" ? "text-red-400" : "text-white/50"}`}>{me.role}</div>
        </div>
      )}

      <div className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="text-xs text-white/60">Register</div>
          <input
            type="email"
            placeholder="Email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            required
          />
          <button className="w-full rounded-xl bg-red-500 hover:bg-red-400 transition px-3 py-2 font-semibold">
            Register
          </button>
        </form>

        <div className="h-px bg-white/10" />

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="text-xs text-white/60">Login</div>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            required
          />
          <button className="w-full rounded-xl bg-white/10 hover:bg-white/20 transition px-3 py-2 font-semibold">
            Login
          </button>
        </form>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-white/60">
          {status ? status : "Create account then login"}
        </span>
        <button
          onClick={logout}
          className="text-xs text-white/60 hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
