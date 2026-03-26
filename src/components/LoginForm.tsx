"use client";

import {
  credentialsValid,
  MOCK_ADMIN_EMAIL,
  setAdminSessionCookie,
} from "@/lib/auth-mock";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Input } from "./ui/Input";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!credentialsValid(email, password)) {
      setError("Email atau password tidak valid.");
      return;
    }
    setLoading(true);
    setAdminSessionCookie();
    await new Promise((r) => setTimeout(r, 200));
    router.push(from.startsWith("/") ? from : "/admin");
    router.refresh();
    setLoading(false);
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader
        title="Masuk admin"
        description="Akses terbatas untuk panitia. MVP: kredensial mock (lihat petunjuk di bawah)."
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="admin-email"
            type="email"
            label="Email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="admin-password"
            type="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses…" : "Masuk"}
          </Button>
        </form>
        <p className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]/50 p-3 text-xs leading-relaxed text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">Demo:</strong> email{" "}
          <span className="font-mono text-[var(--accent)]">{MOCK_ADMIN_EMAIL}</span> · password{" "}
          <span className="font-mono text-[var(--accent)]">admin123</span>
        </p>
      </CardBody>
    </Card>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12 text-sm text-[var(--muted)]">Memuat…</div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
