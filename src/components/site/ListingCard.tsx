import { Link } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
import { formatPrice, listingImage, type Gender, type Listing } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { formatPlace } from "@/lib/places";
import { CategoryBadge } from "./CategoryBadge";
import { FavoriteButton } from "./FavoriteButton";
import { PerkBadges } from "./PerkBadges";

const GENDER_COLORS: Record<Gender, string> = {
  Berniukams: "bg-sky-100 text-sky-800",
  Mergaitėms: "bg-pink-100 text-pink-800",
  Visiems: "bg-amber-100 text-amber-800",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    // The heart sits beside the link, not inside it: a button cannot be nested in a link.
    <div className="relative flex flex-col">
      <Link
        to="/bureliai/$id"
        params={{ id: listing.id }}
        className="group flex flex-1 flex-col rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <img
            src={listingImage(listing)}
            alt={listing.title}
            loading="lazy"
            width={1024}
            height={768}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <CategoryBadge category={listing.category} solid className="absolute left-3 top-3" />
          {listing.userSubmitted && (
            <span className="absolute bottom-3 left-3 rounded-full bg-teal px-2.5 py-1 text-xs font-semibold text-teal-foreground shadow-sm">
              Nauja
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 px-1 pt-3">
          <h3 className="line-clamp-1 font-bold text-foreground group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {formatPlace(listing)}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {listing.ages.map((a) => (
              <span
                key={a}
                className="rounded-md border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {a}
              </span>
            ))}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                GENDER_COLORS[listing.gender],
              )}
            >
              <Users className="size-3" />
              {listing.gender}
            </span>
          </div>
          <PerkBadges perks={listing.perks} />
          <p className="mt-auto pt-2 text-sm text-muted-foreground">
            <span className="text-base font-bold text-foreground">
              {formatPrice(listing.price)}
            </span>{" "}
            / mėn.
          </p>
        </div>
      </Link>
      <FavoriteButton listingId={listing.id} className="absolute right-3 top-3" />
    </div>
  );
}
