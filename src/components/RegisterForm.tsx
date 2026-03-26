"use client";

import { useTournament } from "@/context/tournament-context";
import { VALORANT_RANKS, type ValorantRank } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";

const RIOT_ID_RE = /^[^#]+#\d+$/;

type FieldErrors = Partial<Record<string, string>>;

export function RegisterForm() {
  const { registerPlayer } = useTournament();
  const [name, setName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [rank, setRank] = useState<ValorantRank | "">("");
  const [contact, setContact] = useState("");
  const [availability, setAvailability] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Nama lengkap wajib diisi.";
    const rid = riotId.trim();
    if (!rid) next.riot_id = "Riot ID wajib diisi.";
    else if (!RIOT_ID_RE.test(rid))
      next.riot_id = "Format: NamaInGame#1234 (tag angka setelah #).";
    if (!rank) next.rank = "Pilih rank kamu.";
    if (!contact.trim()) next.contact = "Kontak WhatsApp atau Discord wajib diisi.";
    if (!availability.trim())
      next.availability = "Isi ketersediaan waktu (mis. weekday malam, weekend).";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = await registerPlayer({
      name: name.trim(),
      riot_id: riotId.trim(),
      rank: rank as ValorantRank,
      contact: contact.trim(),
      availability: availability.trim(),
      notes: notes.trim(),
    });
    setSubmitting(false);
    if (!result.ok) {
      setErrors({ riot_id: result.error });
      return;
    }
    setSubmitted(true);
    setName("");
    setRiotId("");
    setRank("");
    setContact("");
    setAvailability("");
    setNotes("");
    setErrors({});
  }

  if (submitted) {
    return (
      <Card>
        <CardBody className="py-14 text-center">
          <p className="text-sm font-medium text-[var(--accent)]">Pendaftaran diterima</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Terima kasih sudah mendaftar
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Data kamu hanya visible untuk panitia. Pantau pembagian tim di halaman publik setelah
            admin menyelesaikan pengaturan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/live">
              <Button>Ke Pembagian Tim</Button>
            </Link>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Daftar lagi
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Form pendaftaran"
        description="Individu — tanpa pemilihan role. Data sensitif tidak ditampilkan ke publik."
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5" noValidate>
          <Input
            id="full-name"
            label="Nama lengkap"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            id="riot-id"
            label="Riot ID"
            placeholder="NamaInGame#1234"
            hint="Format nama dengan tag angka setelah tanda #."
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            error={errors.riot_id}
          />
          <Select
            id="rank"
            label="Rank kompetitif"
            value={rank}
            onChange={(e) => {
              setRank(e.target.value as ValorantRank | "");
              setErrors((prev) => ({ ...prev, rank: undefined }));
            }}
            error={errors.rank}
          >
            <option value="">Pilih rank</option>
            {VALORANT_RANKS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Input
            id="contact"
            label="Kontak (WhatsApp / Discord)"
            placeholder="Contoh: 08… atau user#0000"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={errors.contact}
          />
          <Input
            id="availability"
            label="Ketersediaan waktu"
            placeholder="Mis. Sen–Jum malam, weekend fleksibel"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            error={errors.availability}
          />
          <Textarea
            id="notes"
            label="Catatan (opsional)"
            placeholder="Hal yang ingin disampaikan ke panitia"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Mengirim…" : "Kirim pendaftaran"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
