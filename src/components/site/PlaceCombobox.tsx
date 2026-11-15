import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ALL, normalizeText } from "@/lib/listings";
import { PLACE_GROUPS } from "@/lib/places";
import { cn } from "@/lib/utils";

interface PlaceComboboxProps {
  id?: string;
  /** A place name, `ALL`, or "" when nothing is chosen yet. */
  value: string;
  onChange: (value: string) => void;
  /** When set, the list starts with an "everywhere" option that selects `ALL`. */
  allLabel?: string;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
}

/** Searchable picker for a city, town or village. */
export function PlaceCombobox({
  id,
  value,
  onChange,
  allLabel,
  placeholder = "Pasirinkite",
  invalid,
  className,
}: PlaceComboboxProps) {
  const [open, setOpen] = useState(false);
  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };
  const label = value === ALL ? allLabel : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={!!invalid}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
            invalid && "border-destructive",
            className,
          )}
        >
          <span className={cn("truncate", !label && "font-normal text-muted-foreground")}>
            {label || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        <Command
          filter={(itemValue, search) =>
            normalizeText(itemValue).includes(normalizeText(search.trim())) ? 1 : 0
          }
        >
          <CommandInput placeholder="Ieškoti vietos..." />
          <CommandList>
            <CommandEmpty>Tokios vietos sąraše nėra</CommandEmpty>
            {allLabel && (
              <CommandGroup>
                <CommandItem value={allLabel} onSelect={() => pick(ALL)}>
                  {allLabel}
                  {value === ALL && <Check className="ml-auto" />}
                </CommandItem>
              </CommandGroup>
            )}
            {PLACE_GROUPS.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.places.map((place) => (
                  <CommandItem key={place} value={place} onSelect={() => pick(place)}>
                    {place}
                    {value === place && <Check className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
