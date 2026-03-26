import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Para Pencari Tuhan — Fun Match Valorant",
  description:
    "Pendaftaran dan pembagian tim fun match Valorant komunitas — solo player, no toxic, community-based.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--border)] px-4 py-6 pb-8 text-center text-xs leading-relaxed text-[var(--muted)] sm:pb-6">
            Komunitas · Fun match · Para Pencari Tuhan
          </footer>
        </Providers>
      </body>
    </html>
  );
}
