"use client";

import {
  ADMIN_SESSION_CHANGED_EVENT,
  isAdminSessionCookiePresent,
} from "@/lib/auth-mock";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/register", label: "Daftar" },
  { href: "/live", label: "Pembagian" },
  { href: "/bracket", label: "Bracket" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const syncAdminSession = useCallback(() => {
    setAdminLoggedIn(isAdminSessionCookiePresent());
  }, []);

  useEffect(() => {
    syncAdminSession();
    window.addEventListener("focus", syncAdminSession);
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, syncAdminSession);
    return () => {
      window.removeEventListener("focus", syncAdminSession);
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, syncAdminSession);
    };
  }, [syncAdminSession]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="min-w-0 shrink text-sm font-semibold leading-tight tracking-tight text-[var(--foreground)] transition hover:text-[var(--accent)] sm:text-base"
          onClick={() => setMenuOpen(false)}
        >
          <span className="hidden sm:inline">Para Pencari Tuhan</span>
          <span className="sm:hidden">PPT</span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex md:gap-1"
          aria-label="Utama"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
          {adminLoggedIn ? (
            <Link
              href="/admin"
              className="ml-1 rounded-lg border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/15"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {adminLoggedIn ? (
            <Link
              href="/admin"
              className="rounded-lg border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-2.5 py-2 text-xs font-medium text-[var(--accent)]"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-[var(--border)] px-2.5 py-2 text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <span className="text-lg leading-none">×</span>
            ) : (
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--border)] bg-[var(--background)] md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 text-sm text-[var(--foreground)] hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
