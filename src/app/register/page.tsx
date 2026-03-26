import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Daftar sebagai pemain
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Satu akun Riot ID hanya boleh mendaftar sekali. Pastikan data kontak aktif untuk
          komunikasi panitia.
        </p>
      </div>
      <RegisterForm />
    </main>
  );
}
