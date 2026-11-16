import type { ReactNode } from "react";
import { LEGAL_UPDATED, SITE_OWNER } from "@/lib/site-info";

/** Shared frame for the privacy policy and the terms: title, date, readable column. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const updated = new Intl.DateTimeFormat("lt-LT", { dateStyle: "long" }).format(
    new Date(LEGAL_UPDATED),
  );
  return (
    <div className="container-page max-w-3xl pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Atnaujinta: {updated}</p>
      <p className="mt-4 text-muted-foreground">{intro}</p>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-foreground/85 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

/** Who runs the site and how to reach them, or an honest note that it is still missing. */
export function OwnerContact() {
  if (!SITE_OWNER.name || !SITE_OWNER.email) {
    return <p>Valdytojo pavadinimas ir kontaktai bus paskelbti čia prieš svetainės paleidimą.</p>;
  }
  return (
    <p>
      {SITE_OWNER.name}, el. paštas <a href={`mailto:${SITE_OWNER.email}`}>{SITE_OWNER.email}</a>.
    </p>
  );
}
