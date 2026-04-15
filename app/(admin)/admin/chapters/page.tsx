"use client";

import { useEffect, useMemo, useState } from "react";

type Manga = {
  id: string;
  title: string;
};

type Chapter = {
  id: string;
  title: string;
  content?: string;
  order: number;
  isPreview: boolean;
};

export default function AdminChaptersPage() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [selectedManga, setSelectedManga] = useState<string>("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("manga_token");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const mangaId = params.get("mangaId");
    if (mangaId) {
      setSelectedManga(mangaId);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadManga() {
      if (!token) return;
      try {
        const res = await fetch("/api/manga?page=1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setManga(list);
        if (list[0]?.id) setSelectedManga(list[0].id);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadManga();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    async function loadChapters() {
      if (!token || !selectedManga) return;
      try {
        const res = await fetch(
          `/api/chapters?mangaId=${selectedManga}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setChapters((prev) => (page === 1 ? list : [...prev, ...list]));
        if (list.length < 10) setHasMore(false);
      } catch {
        if (active) setStatus("Failed to load chapters");
      }
    }
    setChapters([]);
    setHasMore(true);
    setPage(1);
    loadChapters();
    return () => {
      active = false;
    };
  }, [selectedManga, token]);

  useEffect(() => {
    let active = true;
    async function loadMore() {
      if (!token || !selectedManga || page === 1) return;
      try {
        const res = await fetch(
          `/api/chapters?mangaId=${selectedManga}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setChapters((prev) => [...prev, ...list]);
        if (list.length < 10) setHasMore(false);
      } catch {
        if (active) setStatus("Failed to load chapters");
      }
    }
    loadMore();
    return () => {
      active = false;
    };
  }, [page, selectedManga, token]);

  useEffect(() => {
    if (editingId) return;
    if (chapters.length === 0) {
      setOrder(1);
      return;
    }
    const maxOrder = Math.max(...chapters.map((c) => c.order || 0));
    setOrder(maxOrder + 1);
  }, [chapters, editingId]);

  async function createChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("Login required");
      return;
    }
    setStatus(null);
    const res = await fetch("/api/chapters/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mangaId: selectedManga,
        title,
        content,
        order,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Create failed");
      return;
    }

    setTitle("");
    setContent("");
    setOrder((prev) => prev + 1);
    // no preview field
    setStatus("Created");
    setPage(1);
    setChapters([]);
    setHasMore(true);
    setTimeout(() => setStatus(null), 1500);
  }

  async function updateChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingId) {
      setStatus("Login required");
      return;
    }
    setStatus(null);
    const res = await fetch(`/api/chapters/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        order,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Update failed");
      return;
    }

    setEditingId(null);
    setTitle("");
    setContent("");
    setOrder(1);
    // no preview field
    setStatus("Updated");
    setPage(1);
    setChapters([]);
    setHasMore(true);
    setTimeout(() => setStatus(null), 1500);
  }

  async function deleteChapter(id: string) {
    if (!token) {
      setStatus("Login required");
      return;
    }
    const ok = window.confirm("Delete this chapter?");
    if (!ok) return;
    const res = await fetch(`/api/chapters/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Delete failed");
      return;
    }
    setChapters((prev) => prev.filter((c) => c.id !== id));
  }

  function startEdit(c: Chapter) {
    setEditingId(c.id);
    setTitle(c.title);
    setContent(c.content || "");
    setOrder(c.order);
    setStatus(null);
  }

  if (loading) {
    return <p className="text-white/60">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Chapters</h1>
        <p className="text-white/60 text-sm mt-1">
          Create and manage chapters by manga.
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        <form
          onSubmit={editingId ? updateChapter : createChapter}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-white/70">Manga</label>
            <select
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
              value={selectedManga}
              onChange={(e) => setSelectedManga(e.target.value)}
            >
              {manga.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70">Title</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70">Content</label>
            <textarea
              className="mt-2 w-full min-h-[120px] rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div>
            <div>
              <label className="block text-sm text-white/70">Order</label>
              <input
                type="number"
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2 outline-none focus:border-white/30"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 transition px-4 py-2 font-semibold">
              {editingId ? "Update Chapter" : "Create Chapter"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setOrder(1);
                }}
                className="px-4 py-2 rounded-xl border border-white/20 text-sm hover:border-white/40 transition"
              >
                Cancel
              </button>
            )}
          </div>

          {status && (
            <p className="text-sm text-white/70">{status}</p>
          )}
        </form>

        <div className="space-y-4">
          <div className="text-sm text-white/70">
            Chapters for{" "}
            {manga.find((m) => m.id === selectedManga)?.title || "selected manga"}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {chapters.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-xs text-white/60">Order #{c.order}</div>
                <div className="text-lg font-semibold mt-1">{c.title}</div>
                <div className="text-xs text-white/60 mt-2">
                  Order #{c.order}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChapter(c.id)}
                    className="px-3 py-1 rounded-lg border border-red-500/40 text-xs text-red-300 hover:border-red-400 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:border-white/40 transition"
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
