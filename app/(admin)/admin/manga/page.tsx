"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Manga = {
  id: string;
  title: string;
  _count?: { chapters: number };
};

type Chapter = {
  id: string;
  title: string;
  content?: string;
  order?: number;
};

export default function Page() {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chaptersByManga, setChaptersByManga] = useState<
    Record<string, Chapter[]>
  >({});
  const [pageByManga, setPageByManga] = useState<Record<string, number>>({});
  const [hasMoreByManga, setHasMoreByManga] = useState<Record<string, boolean>>(
    {}
  );
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("manga_token");
        const res = await fetch("/api/manga?page=1", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (active) setManga(Array.isArray(data) ? data : []);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function toggleManga(id: string) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!chaptersByManga[id]) {
      const res = await fetch(`/api/chapters?mangaId=${id}&page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setChaptersByManga((prev) => ({
        ...prev,
        [id]: list,
      }));
      setPageByManga((prev) => ({ ...prev, [id]: 1 }));
      setHasMoreByManga((prev) => ({
        ...prev,
        [id]: list.length === 10,
      }));
    }
  }

  async function loadMoreChapters(id: string) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }
    const nextPage = (pageByManga[id] || 1) + 1;
    const res = await fetch(`/api/chapters?mangaId=${id}&page=${nextPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setChaptersByManga((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), ...list],
    }));
    setPageByManga((prev) => ({ ...prev, [id]: nextPage }));
    setHasMoreByManga((prev) => ({
      ...prev,
      [id]: list.length === 10,
    }));
  }

  async function deleteChapter(mangaId: string, id: string) {
    const token = localStorage.getItem("manga_token");
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
    setChaptersByManga((prev) => ({
      ...prev,
      [mangaId]: (prev[mangaId] || []).filter((c) => c.id !== id),
    }));
  }

  function startEditChapter(c: Chapter) {
    setEditingChapterId(c.id);
    setChapterTitle(c.title);
  }

  async function saveChapter(mangaId: string, id: string) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }
    const res = await fetch(`/api/chapters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: chapterTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Update failed");
      return;
    }
    setChaptersByManga((prev) => ({
      ...prev,
      [mangaId]: (prev[mangaId] || []).map((c) =>
        c.id === id ? { ...c, title: chapterTitle } : c
      ),
    }));
    setEditingChapterId(null);
    setChapterTitle("");
  }

  async function saveEdit(id: string) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }
    const res = await fetch(`/api/manga/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editTitle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Update failed");
      return;
    }
    setManga((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title: editTitle } : m))
    );
    setEditingId(null);
    setEditTitle("");
  }

  async function deleteManga(id: string) {
    const token = localStorage.getItem("manga_token");
    if (!token) {
      setStatus("Login required");
      return;
    }
    const ok = window.confirm("Delete this manga and all chapters?");
    if (!ok) return;
    const res = await fetch(`/api/manga/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setStatus(err?.error || "Delete failed");
      return;
    }
    setManga((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Manga List</h1>
        <Link
          href="/admin/manga/create"
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 transition text-sm font-semibold"
        >
          Create Manga
        </Link>
      </div>

      {loading ? (
        <p className="text-white/60 mt-6">Loading...</p>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {manga.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="text-sm text-white/60">Title</div>
              {editingId === m.id ? (
                <input
                  className="mt-2 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <button
                  onClick={() => toggleManga(m.id)}
                  className="text-lg font-semibold mt-1 text-left w-full"
                >
                  {m.title}
                </button>
              )}
              <div className="text-xs text-white/60 mt-2">
                Chapters: {m._count?.chapters ?? 0}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/admin/chapters?mangaId=${m.id}`}
                  className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                >
                  Add Chapters
                </Link>
                {editingId === m.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(m.id)}
                      className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditTitle("");
                      }}
                      className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setEditTitle(m.title);
                      }}
                      className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteManga(m.id)}
                      className="px-3 py-1 rounded-lg border border-red-500/40 text-xs text-red-300 hover:border-red-400 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {expandedId === m.id && (
                <div className="mt-4 space-y-2">
                  {(chaptersByManga[m.id] || []).map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        {editingChapterId === c.id ? (
                          <input
                            className="w-full mr-2 rounded-md bg-black/40 border border-white/10 px-2 py-1 text-xs"
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                          />
                        ) : (
                          <span>{c.title}</span>
                        )}
                        <div className="flex items-center gap-2">
                          {editingChapterId === c.id ? (
                            <button
                              onClick={() => saveChapter(m.id, c.id)}
                              className="px-2 py-1 rounded-md border border-white/20 text-[10px] hover:border-white/40 transition"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => startEditChapter(c)}
                              className="px-2 py-1 rounded-md border border-white/20 text-[10px] hover:border-white/40 transition"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => deleteChapter(m.id, c.id)}
                            className="px-2 py-1 rounded-md border border-red-500/40 text-[10px] text-red-300 hover:border-red-400 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(chaptersByManga[m.id] || []).length === 0 && (
                    <p className="text-xs text-white/50">No chapters yet</p>
                  )}
                  {hasMoreByManga[m.id] && (
                    <button
                      onClick={() => loadMoreChapters(m.id)}
                      className="px-3 py-1 rounded-lg border border-white/20 text-xs hover:border-white/40 transition"
                    >
                      Load more
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {status && <p className="text-sm text-white/70 mt-4">{status}</p>}
    </div>
  );
}
