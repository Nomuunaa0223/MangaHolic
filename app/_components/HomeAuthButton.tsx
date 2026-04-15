"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeAuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("manga_token");
    setLoggedIn(!!token);
  }, []);

  function logout() {
    localStorage.removeItem("manga_token");
    setLoggedIn(false);
    window.location.href = "/";
  }

  if (!loggedIn) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:border-white/40 transition"
      >
        Login
      </Link>
    );
  }

  return (
    <button
      onClick={logout}
      className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:border-white/40 transition"
    >
      Logout
    </button>
  );
}
