import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link
      to="/"
      search={{}}
      className="flex items-center gap-2.5"
      aria-label="Veiklų Pasaulis – pradžia"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="3.2" fill="currentColor" />
          <circle cx="16.5" cy="9.5" r="2.4" fill="currentColor" opacity="0.8" />
          <circle cx="11" cy="16" r="3.8" fill="currentColor" opacity="0.9" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        Veiklų <span className="text-brand-gradient">Pasaulis</span>
      </span>
    </Link>
  );
}
