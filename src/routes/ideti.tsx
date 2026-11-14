import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AGE_GROUPS,
  CATEGORIES,
  CITIES,
  VILNIUS_DISTRICTS,
  type AgeGroup,
  type Audience,
  type Category,
  type City,
  type Gender,
  type ScheduleSlot,
} from "@/lib/listings";
import { addListing } from "@/lib/listings-store";

export const Route = createFileRoute("/ideti")({
  head: () => ({
    meta: [
      { title: "Įdėti būrelį – Būrelių Erdvė" },
      {
        name: "description",
        content: "Įdėkite savo būrelį nemokamai ir pasiekite tėvus bei suaugusiuosius jūsų mieste.",
      },
      { property: "og:title", content: "Įdėti būrelį – Būrelių Erdvė" },
      {
        property: "og:description",
        content: "Įdėkite savo būrelį nemokamai ir pasiekite tėvus bei suaugusiuosius.",
      },
    ],
  }),
  component: AddListing,
});

const AUDIENCE_OPTIONS: Audience[] = ["Vaikams", "Suaugusiems", "Visiems"];
const GENDER_OPTIONS: Gender[] = ["Visiems", "Berniukams", "Mergaitėms"];

const schema = z.object({
  title: z.string().trim().min(3, "Įveskite pavadinimą").max(100, "Per ilgas pavadinimas"),
  city: z.enum(CITIES, { message: "Pasirinkite miestą" }),
  district: z.string().trim().min(2, "Nurodykite mikrorajoną").max(60),
  address: z.string().trim().min(3, "Įveskite adresą").max(150),
  category: z.enum(CATEGORIES, { message: "Pasirinkite kategoriją" }),
  audience: z.enum(["Vaikams", "Suaugusiems", "Visiems"]),
  ages: z.array(z.enum(AGE_GROUPS)).min(1, "Pasirinkite bent vieną amžiaus grupę"),
  gender: z.enum(["Visiems", "Berniukams", "Mergaitėms"]),
  price: z.coerce
    .number({ invalid_type_error: "Įveskite kainą" })
    .min(0, "Kaina negali būti neigiama")
    .max(10000, "Per didelė kaina"),
  schedule: z.string().trim().max(500),
  description: z.string().trim().min(30, "Aprašymas turi būti bent 30 simbolių").max(3000),
  contactName: z.string().trim().min(2, "Įveskite vardą").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Įveskite telefono numerį")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Neteisingas telefono numeris"),
  email: z.string().trim().email("Neteisingas el. pašto adresas").max(255),
});

type FormValues = {
  title: string;
  city: string;
  district: string;
  address: string;
  category: string;
  audience: Audience;
  ages: AgeGroup[];
  gender: Gender;
  price: string;
  schedule: string;
  description: string;
  contactName: string;
  phone: string;
  email: string;
};
type Errors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
  title: "",
  city: "Vilnius",
  district: "",
  address: "",
  category: "",
  audience: "Vaikams",
  ages: [],
  gender: "Visiems",
  price: "",
  schedule: "",
  description: "",
  contactName: "",
  phone: "",
  email: "",
};

function parseSchedule(text: string): ScheduleSlot[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...rest] = line.split(/\s+/);
      return { day: day ?? "", time: rest.join(" ") || "—" };
    });
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {active && <Check className="size-4" />}
      {children}
    </button>
  );
}

function Section({ title, step, children }: { title: string; step: number; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-extrabold">
        <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-sm text-primary">
          {step}
        </span>
        {title}
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function AddListing() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));
  const text = (k: keyof FormValues) => ({
    id: `f-${k}`,
    value: values[k] as string,
    onChange: (e: { target: { value: string } }) => set(k, e.target.value as never),
    "aria-invalid": !!errors[k],
    className: errors[k] ? "border-destructive" : undefined,
  });

  const toggleAge = (age: AgeGroup) =>
    set(
      "ages",
      values.ages.includes(age) ? values.ages.filter((a) => a !== age) : [...values.ages, age],
    );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        errs[key] ??= issue.message;
      }
      setErrors(errs);
      toast.error("Patikrinkite pažymėtus laukus");
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const d = parsed.data;
    const firstSentence = d.description.split(/(?<=[.!?])\s/)[0] ?? d.description;
    const created = addListing({
      title: d.title,
      city: d.city as City,
      district: d.district,
      address: d.address,
      category: d.category as Category,
      audience: d.audience,
      ages: d.ages,
      gender: d.gender,
      price: d.price,
      shortDescription: firstSentence.slice(0, 140),
      description: d.description,
      schedule: parseSchedule(d.schedule),
      contactName: d.contactName,
      phone: d.phone,
      email: d.email,
    });
    toast.success("Būrelis įdėtas!", { description: "Jis jau matomas būrelių sąraše." });
    navigate({ to: "/bureliai/$id", params: { id: created.id } });
  }

  const isVilnius = values.city === "Vilnius";

  return (
    <div className="bg-hero-wash">
      <div className="container-page max-w-4xl pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal">
          Nemokama
        </span>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Įdėti būrelį</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Užpildykite informaciją apie savo būrelį – vos kelios minutės ir jus ras šimtai tėvų bei
          suaugusiųjų.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
          <Section title="Pagrindinė informacija" step={1}>
            <Field label="Būrelio pavadinimas" htmlFor="f-title" error={errors.title} className="sm:col-span-2">
              <Input {...text("title")} placeholder="pvz. Keramikos studija „Molio namai“" maxLength={100} />
            </Field>
            <Field label="Kategorija" htmlFor="f-category" error={errors.category}>
              <Select value={values.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="f-category" className={cn("h-10", errors.category && "border-destructive")}>
                  <SelectValue placeholder="Pasirinkite" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kaina (€ / mėn.)" htmlFor="f-price" error={errors.price}>
              <Input {...text("price")} type="number" inputMode="numeric" min={0} placeholder="50" />
            </Field>
          </Section>

          <Section title="Vieta" step={2}>
            <Field label="Miestas" htmlFor="f-city" error={errors.city}>
              <Select
                value={values.city}
                onValueChange={(v) => setValues((p) => ({ ...p, city: v, district: "" }))}
              >
                <SelectTrigger id="f-city" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mikrorajonas" htmlFor="f-district" error={errors.district}>
              {isVilnius ? (
                <Select value={values.district} onValueChange={(v) => set("district", v)}>
                  <SelectTrigger id="f-district" className={cn("h-10", errors.district && "border-destructive")}>
                    <SelectValue placeholder="Pasirinkite" />
                  </SelectTrigger>
                  <SelectContent>
                    {VILNIUS_DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input {...text("district")} placeholder="pvz. Centras" maxLength={60} />
              )}
            </Field>
            <Field label="Adresas" htmlFor="f-address" error={errors.address} className="sm:col-span-2">
              <Input {...text("address")} placeholder="pvz. Gedimino pr. 1, Vilnius" maxLength={150} />
            </Field>
          </Section>

          <Section title="Kam skirtas būrelis" step={3}>
            <Field label="Auditorija" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((a) => (
                  <Chip key={a} active={values.audience === a} onClick={() => set("audience", a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Amžiaus grupės" error={errors.ages} hint="Galite pasirinkti kelias" className="sm:col-span-2">
              <div id="f-ages" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
                {AGE_GROUPS.map((a) => (
                  <Chip key={a} active={values.ages.includes(a)} onClick={() => toggleAge(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Lytis" className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <Chip key={g} active={values.gender === g} onClick={() => set("gender", g)}>
                    {g}
                  </Chip>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Aprašymas ir tvarkaraštis" step={4}>
            <Field
              label="Aprašymas"
              htmlFor="f-description"
              error={errors.description}
              hint="Ką veiksite, kas veda užsiėmimus, kuo išsiskiriate"
              className="sm:col-span-2"
            >
              <Textarea {...text("description")} rows={6} maxLength={3000} />
            </Field>
            <Field
              label="Tvarkaraštis (neprivaloma)"
              htmlFor="f-schedule"
              error={errors.schedule}
              hint="Kiekviena diena naujoje eilutėje, pvz. „Pirmadienis 17:00 – 18:00“"
              className="sm:col-span-2"
            >
              <Textarea {...text("schedule")} rows={3} maxLength={500} placeholder={"Pirmadienis 17:00 – 18:00\nTrečiadienis 17:00 – 18:00"} />
            </Field>
          </Section>

          <Section title="Kontaktai" step={5}>
            <Field label="Vadovo vardas ir pavardė" htmlFor="f-contactName" error={errors.contactName} className="sm:col-span-2">
              <Input {...text("contactName")} autoComplete="name" maxLength={100} />
            </Field>
            <Field label="Telefonas" htmlFor="f-phone" error={errors.phone}>
              <Input {...text("phone")} type="tel" autoComplete="tel" placeholder="+370 600 00000" maxLength={30} />
            </Field>
            <Field label="El. paštas" htmlFor="f-email" error={errors.email}>
              <Input {...text("email")} type="email" autoComplete="email" maxLength={255} />
            </Field>
          </Section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="lg" onClick={() => { setValues(INITIAL); setErrors({}); }}>
              Išvalyti
            </Button>
            <Button type="submit" size="xl" variant="teal">
              <Plus /> Paskelbti būrelį
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
