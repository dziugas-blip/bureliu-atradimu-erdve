import { cn } from "@/lib/utils";
import type { Category } from "@/lib/listings";

const STYLES: Record<Category, string> = {
  Šokiai: "bg-cat-dance/12 text-cat-dance",
  Sportas: "bg-cat-sport/12 text-cat-sport",
  Menai: "bg-cat-art/15 text-cat-art",
  "IT ir robotika": "bg-cat-tech/12 text-cat-tech",
  Muzika: "bg-cat-music/12 text-cat-music",
  Kalbos: "bg-cat-lang/12 text-cat-lang",
};

export function CategoryBadge({
  category,
  solid,
  className,
}: {
  category: Category;
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        solid ? "bg-background/95 text-foreground shadow-sm backdrop-blur" : STYLES[category],
        className,
      )}
    >
      {solid && (
        <span className={cn("mr-1.5 size-1.5 rounded-full", STYLES[category].split(" ")[1].replace("text-", "bg-"))} />
      )}
      {category}
    </span>
  );
}
