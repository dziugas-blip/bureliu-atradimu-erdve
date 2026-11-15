import { Gift, Wallet, type LucideIcon } from "lucide-react";
import { PERKS, type PerkId } from "@/lib/listings";
import { cn } from "@/lib/utils";

const ICONS: Record<PerkId, LucideIcon> = {
  nvs: Wallet,
  trial: Gift,
};

interface PerkBadgesProps {
  perks: readonly PerkId[] | undefined;
  /** Cards use the short text; the listing page spells each perk out. */
  size?: "short" | "full";
  className?: string;
}

export function PerkBadges({ perks, size = "short", className }: PerkBadgesProps) {
  const shown = PERKS.filter((p) => perks?.includes(p.id));
  if (shown.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((p) => {
        const Icon = ICONS[p.id];
        return (
          <li
            key={p.id}
            title={p.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-md bg-primary-soft font-medium text-primary",
              size === "short" ? "px-2 py-0.5 text-xs" : "gap-2 rounded-lg px-3 py-2 text-sm",
            )}
          >
            <Icon className={size === "short" ? "size-3" : "size-4"} />
            {size === "short" ? p.short : p.label}
          </li>
        );
      })}
    </ul>
  );
}
