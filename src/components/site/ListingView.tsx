import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Globe, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { formatPrice, listingImage, type Listing } from "@/lib/listings";
import { formatPlace } from "@/lib/places";
import { organizerIdOf } from "@/lib/profile-store";
import { CategoryBadge } from "./CategoryBadge";
import { ContactRow } from "./ContactRow";
import { FavoriteButton } from "./FavoriteButton";
import { InquiryForm } from "./InquiryForm";
import { PerkBadges } from "./PerkBadges";

/**
 * The full public page of one activity. Shared by the real listing route and by the
 * organiser's "how others see it" preview, so the two can never drift apart.
 */
export function ListingView({ listing }: { listing: Listing }) {
  const facts = [
    { label: "Auditorija", value: listing.audience },
    { label: "Amžius", value: listing.ages.join(", ") },
    { label: "Lytis", value: listing.gender },
    { label: "Vieta", value: formatPlace(listing) },
  ];

  return (
    <div className="container-page pt-6">
      <Link
        to="/bureliai"
        search={{}}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Visos veiklos
      </Link>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={listing.category} />
          {listing.userSubmitted && (
            <span className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal">
              Naujai įdėta
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{listing.title}</h1>
          <FavoriteButton listingId={listing.id} withLabel />
        </div>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4" /> {listing.address}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-muted">
        <img
          src={listingImage(listing)}
          alt={listing.title}
          width={1024}
          height={768}
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />
      </div>

      {listing.photos && listing.photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.photos.slice(1).map((src, i) => (
            <li key={`${i}:${src.length}`} className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={src}
                alt={`${listing.title} – nuotrauka ${i + 2}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border p-4">
                <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 font-bold">{f.value}</dd>
              </div>
            ))}
          </dl>

          <PerkBadges perks={listing.perks} size="full" />

          <section>
            <h2 className="text-xl font-extrabold">Apie veiklą</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/85">
              {listing.description}
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <CalendarDays className="size-5 text-primary" /> Tvarkaraštis
            </h2>
            {listing.schedule.length > 0 ? (
              <ul className="mt-4 divide-y rounded-xl border">
                {listing.schedule.map((s, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-semibold">{s.day}</span>
                    <span className="text-muted-foreground">{s.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {listing.scheduleFlexible
                  ? "Laikas derinamas individualiai. Susisiekite su vadovu ir susitarkite dėl jums tinkamo laiko."
                  : "Tvarkaraštį patikslinkite susisiekę su vadovu."}
              </p>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <MapPin className="size-5 text-primary" /> Adresas
            </h2>
            <div className="mt-4 rounded-xl border bg-secondary p-4">
              <p className="font-semibold">{listing.address}</p>
              <p className="text-sm text-muted-foreground">{formatPlace(listing)}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Atidaryti žemėlapyje →
              </a>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-float">
            <p className="text-sm text-muted-foreground">
              <span className="text-3xl font-extrabold text-foreground">
                {formatPrice(listing.price)}
              </span>{" "}
              / mėn.
            </p>
            <div className="mt-5 space-y-2.5 border-y py-5 text-sm">
              <p className="flex items-center gap-2.5">
                <User className="size-4 text-muted-foreground" />
                <Link
                  to="/vadovai/$id"
                  params={{ id: organizerIdOf(listing) }}
                  className="font-semibold underline decoration-muted-foreground/40 underline-offset-4 hover:text-primary hover:decoration-primary"
                >
                  {listing.contactName}
                </Link>
              </p>
              <ContactRow
                icon={Phone}
                value={listing.phone}
                href={`tel:${listing.phone.replace(/\s/g, "")}`}
                actionLabel="Skambinti"
              />
              <ContactRow
                icon={Mail}
                value={listing.email}
                href={`mailto:${listing.email}`}
                actionLabel="Rašyti el. laišką"
              />
              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 break-all hover:text-primary"
                >
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  {listing.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              )}
              <p className="flex items-center gap-2.5">
                <Users className="size-4 text-muted-foreground" /> {listing.gender} ·{" "}
                {listing.ages.join(", ")}
              </p>
            </div>
            <h2 className="mb-4 mt-5 text-lg font-extrabold">Susisiekti su veiklos vadovu</h2>
            <InquiryForm listingTitle={listing.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
