"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function check() {
      const token = localStorage.getItem("manga_token");
      if (!token) {
        router.replace("/auth/login?redirect=/admin");
        return;
      }

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        router.replace("/auth/login?redirect=/admin");
        return;
      }
      const me = await res.json();
      if (active && me?.role?.name !== "ADMIN") {
        router.replace("/");
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
