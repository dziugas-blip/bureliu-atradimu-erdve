import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TIME_OPTIONS } from "@/lib/schedule";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}

/** How far one press of an arrow moves the list, in pixels (about four rows). */
const STEP = 144;

const arrowClass =
  "flex h-8 w-full cursor-pointer items-center justify-center text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:bg-secondary";

/**
 * Time dropdown in the site's own style. The list scrolls with the mouse wheel or by pressing
 * the arrows; unlike the stock select, hovering an arrow does nothing.
 */
export function TimeSelect({ id, value, onChange, invalid }: TimeSelectProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const scroll = (by: number) => listRef.current?.scrollBy({ top: by, behavior: "smooth" });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "flex h-10 w-24 cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
            invalid && "border-destructive",
          )}
        >
          {value}
          <ChevronDown className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-28 overflow-hidden p-0">
        <button
          type="button"
          aria-label="Ankstesni laikai"
          onClick={() => scroll(-STEP)}
          className={cn(arrowClass, "border-b")}
        >
          <ChevronUp className="size-4" />
        </button>
        <div
          ref={(node) => {
            listRef.current = node;
            // Open with the chosen time in view instead of at 06:00. Set scrollTop directly:
            // scrollIntoView would also scroll the page behind the dropdown.
            const chosen = node?.querySelector<HTMLElement>('[aria-selected="true"]');
            if (node && chosen) node.scrollTop = chosen.offsetTop - node.clientHeight / 2;
          }}
          role="listbox"
          className="max-h-52 overflow-y-auto p-1"
        >
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={t === value}
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className={cn(
                "flex h-9 w-full cursor-pointer items-center justify-between rounded-sm px-2 text-sm outline-none hover:bg-accent focus-visible:bg-accent",
                t === value && "bg-primary-soft font-semibold text-primary",
              )}
            >
              {t}
              {t === value && <Check className="size-4" />}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Vėlesni laikai"
          onClick={() => scroll(STEP)}
          className={cn(arrowClass, "border-t")}
        >
          <ChevronDown className="size-4" />
        </button>
      </PopoverContent>
    </Popover>
  );
}
