import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AGE_GROUPS,
  ALL,
  AUDIENCES,
  CATEGORIES,
  DEFAULT_FILTERS,
  GENDERS,
  type Filters,
} from "@/lib/listings";
import { districtsOf } from "@/lib/places";
import { PlaceCombobox } from "./PlaceCombobox";

interface FieldProps {
  label: string;
  value: string;
  allLabel: string;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

function FilterSelect({ label, value, allLabel, options, onChange, disabled }: FieldProps) {
  const id = `filter-${label}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="px-1 text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={!!disabled}>
        <SelectTrigger id={id} className="h-11 rounded-lg bg-background font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FilterBarProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  className?: string;
}

export function FilterBar({ filters, onChange, className }: FilterBarProps) {
  const districts = districtsOf(filters.city);
  const activeCount = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).filter(
    (k) => filters[k] !== DEFAULT_FILTERS[k],
  ).length;

  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-float sm:p-5", className)}>
      <form
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Ieškoti: baletas, robotika, krepšinis..."
            aria-label="Paieška"
            className="h-12 rounded-xl pl-12 text-base shadow-none"
          />
        </div>
        <Button type="submit" size="xl" className="sm:w-auto">
          <Search /> Ieškoti
        </Button>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-1.5 md:col-span-1">
          <label
            htmlFor="filter-place"
            className="px-1 text-xs font-semibold text-muted-foreground"
          >
            Miestas ar gyvenvietė
          </label>
          <PlaceCombobox
            id="filter-place"
            value={filters.city}
            allLabel="Visa Lietuva"
            onChange={(city) => onChange({ city, district: ALL })}
            className="h-11 rounded-lg font-medium"
          />
        </div>
        <FilterSelect
          label="Auditorija"
          value={filters.audience}
          allLabel="Visi"
          options={AUDIENCES}
          onChange={(audience) => onChange({ audience })}
        />
        <FilterSelect
          label="Amžiaus grupė"
          value={filters.age}
          allLabel="Visi"
          options={AGE_GROUPS}
          onChange={(age) => onChange({ age })}
        />
        <FilterSelect
          label="Lytis"
          value={filters.gender}
          allLabel="Visi"
          options={GENDERS}
          onChange={(gender) => onChange({ gender })}
        />
        <FilterSelect
          label="Kategorija"
          value={filters.category}
          allLabel="Visos"
          options={CATEGORIES}
          onChange={(category) => onChange({ category })}
        />
      </div>

      {districts.length > 0 && (
        <div className="mt-4" role="group" aria-labelledby="filter-districts-label">
          <p
            id="filter-districts-label"
            className="px-1 text-xs font-semibold text-muted-foreground"
          >
            Mikrorajonas ({filters.city})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[ALL, ...districts].map((d) => {
              const active = filters.district === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ district: d })}
                  className={cn(
                    "inline-flex h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "bg-background text-muted-foreground hover:border-foreground/60 hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {d === ALL ? "Visi mikrorajonai" : d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            Aktyvūs filtrai: <strong className="text-foreground">{activeCount}</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
            <X /> Išvalyti filtrus
          </Button>
        </div>
      )}
    </div>
  );
}
