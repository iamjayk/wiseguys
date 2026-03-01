"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken, getUser, logout } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
    const token = getToken();
    if (!isPublic && !token) {
      router.replace("/login");
    }
  }, [mounted, pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Loading…</p>
      </div>
    );
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const token = getToken();
  if (!isPublic && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Redirecting to login…</p>
      </div>
    );
  }

  const user = getUser();

  return (
    <>
      {!isPublic && user && (
        <header className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <Link href="/" className="text-white font-medium hover:underline">
              Wise Guys
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm text-zinc-400 hover:text-white">
                {user.displayName}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/login");
                  router.refresh();
                }}
                className="text-sm text-zinc-400 hover:text-white underline"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      {children}
    </>
  );
}
