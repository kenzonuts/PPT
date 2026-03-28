"use client";

import {
  credentialsValid,
  isAdminSessionCookiePresent,
  setAdminSessionCookie,
} from "@/lib/auth-mock";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const dest = from.startsWith("/") ? from : "/admin";
    if (isAdminSessionCookiePresent()) {
      router.replace(dest);
      return;
    }
    setShowForm(true);
  }, [from, router]);

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

  if (!showForm) {
    return (
      <Card className="mx-auto max-w-md">
        <CardBody className="py-12 text-center text-sm text-[var(--muted)]">Memeriksa sesi…</CardBody>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader
        title="Masuk admin"
        description="Akses terbatas untuk panitia. Sudah masuk? Kamu langsung diarahkan ke panel."
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
