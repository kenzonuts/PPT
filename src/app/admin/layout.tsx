export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-0">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(255,70,85,0.07)_0%,transparent_100%)]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
