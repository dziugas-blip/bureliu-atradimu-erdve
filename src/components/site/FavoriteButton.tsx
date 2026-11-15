import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites-store";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  /** Show "Išsaugoti" / "Išsaugota" next to the heart. */
  withLabel?: boolean;
  className?: string;
}

export function FavoriteButton({ listingId, withLabel, className }: FavoriteButtonProps) {
  const saved = useFavorites().includes(listingId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Pašalinti iš mėgstamų" : "Pridėti prie mėgstamų"}
      onClick={() => toggleFavorite(listingId)}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border bg-background/95 text-sm font-semibold shadow-sm outline-none transition-colors hover:border-foreground/60 focus-visible:ring-2 focus-visible:ring-ring",
        withLabel ? "h-10 px-4" : "size-9",
        saved ? "text-rose-600" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Heart className={cn("size-4.5", saved && "fill-current")} />
      {withLabel && (saved ? "Išsaugota" : "Išsaugoti")}
    </button>
  );
}
