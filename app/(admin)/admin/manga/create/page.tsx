"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function createManga() {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }

    setStatus(null);
    const res = await fetch("/api/manga/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      setStatus("Create failed");
      return;
    }

    setTitle("");
    setStatus("Created");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Create Manga</h1>
      <p className="text-white/60 mt-2">
        Add a new title to the library.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-white/70">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
            placeholder="Enter manga title"
          />
        </div>

        {status && (
          <p className="text-sm text-white/70">{status}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={createManga}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 transition text-sm font-semibold"
          >
            Create
          </button>
          <Link
            href="/admin/manga"
            className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:border-white/40 transition"
          >
            Back to list
          </Link>
        </div>
      </div>
    </div>
  );
}
