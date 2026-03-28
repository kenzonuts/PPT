-- Hapus kolom ketersediaan waktu (tidak dipakai lagi di form).
-- Aman dijalankan berulang kali.

alter table public.players drop column if exists availability;
