import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Eye, Plus, Save } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
import {
  AGE_GROUPS,
  CATEGORIES,
  PERKS,
  normalizeWebsite,
  type AgeGroup,
  type Audience,
  type Category,
  type Gender,
  type Listing,
  type PerkId,
} from "@/lib/listings";
import type { ListingData } from "@/lib/listings-db";
import { addListing, updateListing } from "@/lib/listings-store";
import { geocodeAddress } from "@/lib/geocode";
import { ALL_PLACES, CITY_COORDS, districtsOf } from "@/lib/places";
import { saveProfile, useProfile } from "@/lib/profile-store";
import { fromScheduleSlots, invalidDays, toScheduleSlots, type WeekSchedule } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { ListingCard } from "./ListingCard";
import { ListingView } from "./ListingView";
import { MAX_PHOTOS, PhotoUploader } from "./PhotoUploader";
import { PlaceCombobox } from "./PlaceCombobox";
import { SchedulePicker } from "./SchedulePicker";

const AUDIENCE_OPTIONS: Audience[] = ["Vaikams", "Suaugusiems", "Visiems"];
const GENDER_OPTIONS: Gender[] = ["Visiems", "Berniukams", "Mergaitėms"];

const schema = z
  .object({
    title: z.string().trim().min(3, "Įveskite pavadinimą").max(100, "Per ilgas pavadinimas"),
    city: z.string().refine((v) => ALL_PLACES.includes(v), "Pasirinkite miestą ar gyvenvietę"),
    district: z.string().trim().max(60),
    address: z.string().trim().min(3, "Įveskite adresą").max(150),
    category: z.enum(CATEGORIES, { message: "Pasirinkite kategoriją" }),
    audience: z.enum(["Vaikams", "Suaugusiems", "Visiems"]),
    ages: z.array(z.enum(AGE_GROUPS)).min(1, "Pasirinkite bent vieną amžiaus grupę"),
    gender: z.enum(["Visiems", "Berniukams", "Mergaitėms"]),
    price: z.coerce
      .number({ invalid_type_error: "Įveskite kainą" })
      .min(0, "Kaina negali būti neigiama")
      .max(10000, "Per didelė kaina"),
    description: z.string().trim().min(30, "Aprašymas turi būti bent 30 simbolių").max(3000),
    contactName: z.string().trim().min(2, "Įveskite vardą").max(100),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[+\d\s()-]+$/, "Neteisingas telefono numeris")
      // The field starts as "+370 ", so count digits: 370 plus an 8-digit number.
      .refine((v) => v.replace(/\D/g, "").length >= 11, "Įveskite telefono numerį"),
    email: z.string().trim().email("Neteisingas el. pašto adresas").max(255),
    website: z
      .string()
      .trim()
      .max(200)
      .refine((v) => v === "" || normalizeWebsite(v) !== null, "Neteisinga nuoroda"),
  })
  // A microdistrict is required only where the chosen place has them.
  .refine((v) => districtsOf(v.city).length === 0 || districtsOf(v.city).includes(v.district), {
    path: ["district"],
    message: "Pasirinkite mikrorajoną",
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
  description: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
};
type Errors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  title: "",
  city: "Vilnius",
  district: "",
  address: "",
  category: "",
  audience: "Vaikams",
  ages: [],
  gender: "Visiems",
  price: "",
  description: "",
  contactName: "",
  phone: "+370 ",
  email: "",
  website: "",
};

function valuesOf(listing: Listing): FormValues {
  return {
    title: listing.title,
    city: listing.city,
    district: listing.district,
    address: listing.address,
    category: listing.category,
    audience: listing.audience,
    ages: listing.ages,
    gender: listing.gender,
    price: String(listing.price),
    description: listing.description,
    contactName: listing.contactName,
    phone: listing.phone,
    email: listing.email,
    website: listing.website ?? "",
  };
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
        "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "bg-background text-muted-foreground hover:border-foreground/60 hover:bg-secondary hover:text-foreground",
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

/**
 * The add-activity form. Pass `editing` to change an existing listing instead.
 * Beside the form a card shows the listing as it is typed; "Peržiūrėti, kaip atrodo kitiems"
 * swaps the form for the full public page with a bar to go back or publish.
 */
export function ListingForm({ editing }: { editing?: Listing }) {
  const navigate = useNavigate();
  const profile = useProfile();
  const [values, setValues] = useState<FormValues>(editing ? valuesOf(editing) : EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [photos, setPhotos] = useState<string[]>(editing?.photos ?? []);
  const [perks, setPerks] = useState<PerkId[]>(editing?.perks ?? []);
  const [week, setWeek] = useState<WeekSchedule>(
    editing ? fromScheduleSlots(editing.schedule) : {},
  );
  const [flexible, setFlexible] = useState(editing?.scheduleFlexible ?? false);
  const [scheduleError, setScheduleError] = useState<string>();
  /** The validated listing being shown as a full-page preview, or null while editing. */
  const [preview, setPreview] = useState<ListingData | null>(null);
  /** True while the address is looked up and the listing is saved. */
  const [publishing, setPublishing] = useState(false);

  // A new listing starts with the organiser's own name as the contact, once the stored
  // profile has been read.
  useEffect(() => {
    if (editing || !profile.name) return;
    setValues((p) => (p.contactName ? p : { ...p, contactName: profile.name }));
  }, [editing, profile.name]);

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

  /** Check the whole form. Returns the listing, or null after marking what is wrong. */
  function validate(): ListingData | null {
    const parsed = schema.safeParse(values);
    const scheduleProblem =
      invalidDays(week).length > 0
        ? "Pabaigos laikas turi būti vėlesnis už pradžios"
        : !flexible && toScheduleSlots(week).length === 0
          ? "Pažymėkite bent vieną dieną arba „Laikas derinamas individualiai“"
          : undefined;
    setScheduleError(scheduleProblem);
    if (!parsed.success || scheduleProblem !== undefined) {
      const errs: Errors = {};
      for (const issue of parsed.success ? [] : parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        errs[key] ??= issue.message;
      }
      setErrors(errs);
      toast.error("Patikrinkite pažymėtus laukus");
      document.getElementById(`f-${Object.keys(errs)[0] ?? "schedule"}`)?.focus();
      return null;
    }
    setErrors({});
    const d = parsed.data;
    const website = normalizeWebsite(d.website);
    const firstSentence = d.description.split(/(?<=[.!?])\s/)[0] ?? d.description;
    return {
      title: d.title,
      city: d.city,
      district: districtsOf(d.city).length > 0 ? d.district : "",
      address: d.address,
      category: d.category as Category,
      audience: d.audience,
      ages: d.ages,
      gender: d.gender,
      price: d.price,
      shortDescription: firstSentence.slice(0, 140),
      description: d.description,
      schedule: toScheduleSlots(week),
      ...(flexible ? { scheduleFlexible: true } : {}),
      contactName: d.contactName,
      phone: d.phone,
      email: d.email,
      ...(photos.length > 0 ? { photos } : {}),
      ...(perks.length > 0 ? { perks } : {}),
      ...(website ? { website } : {}),
    };
  }

  /** Find where the address is, so the listing gets its own pin on the map. */
  async function withCoordinates(data: ListingData): Promise<ListingData> {
    // An edit that leaves the address alone keeps the position it already has.
    if (
      editing?.lat !== undefined &&
      editing.lng !== undefined &&
      editing.address === data.address &&
      editing.city === data.city
    ) {
      return { ...data, lat: editing.lat, lng: editing.lng };
    }
    const found = await geocodeAddress(data.address, data.city);
    if (found) return { ...data, ...found };
    toast.info("Adreso žemėlapyje rasti nepavyko", {
      description: CITY_COORDS[data.city]
        ? "Veikla žemėlapyje bus rodoma miesto centre. Patikslinkite adresą redaguodami."
        : "Veikla kol kas nebus rodoma žemėlapyje. Patikslinkite adresą redaguodami.",
    });
    return data;
  }

  async function publish(draft: ListingData) {
    if (publishing) return;
    setPublishing(true);
    const data = await withCoordinates(draft);
    const result = editing ? await updateListing(editing.id, data) : await addListing(data);
    setPublishing(false);
    if (result.error !== undefined) {
      toast.error(result.error);
      return;
    }
    // First listing from a new organiser: start their public profile with the name they gave.
    if (!profile.name) void saveProfile({ name: data.contactName });
    if (editing) {
      toast.success("Pakeitimai išsaugoti");
    } else {
      toast.success("Veikla įdėta!", { description: "Ji jau matoma veiklų sąraše." });
    }
    void navigate({ to: "/bureliai/$id", params: { id: result.listing.id } });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const data = validate();
    if (data) void publish(data);
  }

  function openPreview() {
    const data = validate();
    if (!data) return;
    setPreview(data);
    window.scrollTo({ top: 0 });
  }

  const publishLabel = editing ? "Išsaugoti pakeitimus" : "Paskelbti veiklą";

  if (preview) {
    return (
      <>
        <div className="sticky top-16 z-30 border-b bg-background/95 shadow-sm backdrop-blur">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
            <p className="text-sm font-semibold">
              {editing
                ? "Peržiūra: taip jūsų veiklą matys kiti. Pakeitimai dar neišsaugoti."
                : "Peržiūra: taip jūsų veiklą matys kiti. Ji dar nepaskelbta."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  window.scrollTo({ top: 0 });
                }}
              >
                <ArrowLeft /> Grįžti prie redagavimo
              </Button>
              <Button variant="teal" disabled={publishing} onClick={() => void publish(preview)}>
                {editing ? <Save /> : <Plus />}{" "}
                {publishing ? "Saugoma..." : editing ? "Išsaugoti dabar" : "Paskelbti dabar"}
              </Button>
            </div>
          </div>
        </div>
        {/* `inert`: the preview looks exactly like the public page but nothing in it can be
            clicked, so the heart or the enquiry form cannot act on an unpublished listing. */}
        <div inert>
          <ListingView
            listing={{
              ...preview,
              id: editing?.id ?? "perziura",
              userSubmitted: true,
              createdAt: editing?.createdAt ?? new Date().toISOString(),
            }}
          />
        </div>
      </>
    );
  }

  const districts = districtsOf(values.city);

  // What the card looks like right now, filling gaps so a half-typed form still renders.
  const draft: Listing = {
    id: editing?.id ?? "perziura",
    userSubmitted: true,
    createdAt: editing?.createdAt ?? new Date().toISOString(),
    title: values.title.trim() || "Veiklos pavadinimas",
    city: values.city,
    district: districts.includes(values.district) ? values.district : "",
    address: values.address,
    category: CATEGORIES.find((c) => c === values.category) ?? "Sportas",
    audience: values.audience,
    ages: values.ages,
    gender: values.gender,
    price: Number(values.price) || 0,
    shortDescription: "",
    description: values.description,
    schedule: toScheduleSlots(week),
    contactName: values.contactName,
    phone: values.phone,
    email: values.email,
    ...(photos.length > 0 ? { photos } : {}),
    ...(perks.length > 0 ? { perks } : {}),
  };

  return (
    <div className="bg-hero-wash">
      <div className="container-page max-w-6xl pt-12">
        {!editing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal">
            Nemokama
          </span>
        )}
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          {editing ? "Redaguoti veiklą" : "Įdėti veiklą"}
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {editing
            ? "Pakeiskite, ką reikia. Dešinėje matote, kaip kortelė atrodys veiklų sąraše."
            : "Užpildykite informaciją apie savo veiklą – vos kelios minutės ir jus ras šimtai tėvų bei suaugusiųjų."}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <Section title="Pagrindinė informacija" step={1}>
              <Field
                label="Veiklos pavadinimas"
                htmlFor="f-title"
                error={errors.title}
                className="sm:col-span-2"
              >
                <Input
                  {...text("title")}
                  placeholder="pvz. Krepšinio treniruotės „Šuolis“"
                  maxLength={100}
                />
              </Field>
              <Field label="Kategorija" htmlFor="f-category" error={errors.category}>
                <Select value={values.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger
                    id="f-category"
                    className={cn("h-10", errors.category && "border-destructive")}
                  >
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
                <Input
                  {...text("price")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="50"
                />
              </Field>
            </Section>

            <Section title="Vieta" step={2}>
              <Field
                label="Miestas ar gyvenvietė"
                htmlFor="f-city"
                error={errors.city}
                className={districts.length === 0 ? "sm:col-span-2" : undefined}
              >
                <PlaceCombobox
                  id="f-city"
                  value={values.city}
                  onChange={(v) => setValues((p) => ({ ...p, city: v, district: "" }))}
                  invalid={!!errors.city}
                  className="h-10"
                />
              </Field>
              {districts.length > 0 && (
                <Field label="Mikrorajonas" htmlFor="f-district" error={errors.district}>
                  <Select value={values.district} onValueChange={(v) => set("district", v)}>
                    <SelectTrigger
                      id="f-district"
                      className={cn("h-10", errors.district && "border-destructive")}
                    >
                      <SelectValue placeholder="Pasirinkite" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field
                label="Adresas"
                htmlFor="f-address"
                error={errors.address}
                className="sm:col-span-2"
              >
                <Input
                  {...text("address")}
                  placeholder="pvz. Gedimino pr. 1, Vilnius"
                  maxLength={150}
                />
              </Field>
            </Section>

            <Section title="Kam skirta veikla" step={3}>
              <Field label="Auditorija" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map((a) => (
                    <Chip key={a} active={values.audience === a} onClick={() => set("audience", a)}>
                      {a}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field
                label="Amžiaus grupės"
                error={errors.ages}
                hint="Galite pasirinkti kelias"
                className="sm:col-span-2"
              >
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

            <Section title="Privalumai" step={4}>
              <Field
                label="Pažymėkite, kas tinka"
                hint="Jei tinkančių nėra, nieko nežymėkite. Pažymėti privalumai bus rodomi ženkliukais veiklos kortelėje."
                className="sm:col-span-2"
              >
                <div className="flex flex-wrap gap-2">
                  {PERKS.map((p) => (
                    <Chip
                      key={p.id}
                      active={perks.includes(p.id)}
                      onClick={() =>
                        setPerks((prev) =>
                          prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                        )
                      }
                    >
                      {p.label}
                    </Chip>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="Aprašymas ir tvarkaraštis" step={5}>
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
                label="Tvarkaraštis"
                error={scheduleError}
                hint="Pažymėkite dienas ir laiką. Jei pastovaus tvarkaraščio nėra, rinkitės „Laikas derinamas individualiai“."
                className="sm:col-span-2"
              >
                <SchedulePicker
                  id="f-schedule"
                  value={week}
                  flexible={flexible}
                  onChange={(nextWeek, nextFlexible) => {
                    setWeek(nextWeek);
                    setFlexible(nextFlexible);
                    setScheduleError(undefined);
                  }}
                />
              </Field>
            </Section>

            <Section title="Nuotraukos" step={6}>
              <Field
                label="Nuotraukos (rekomenduojame)"
                htmlFor="f-photos"
                hint={`Iki ${MAX_PHOTOS} nuotraukų. Pirmoji įkelta nuotrauka bus viršelis – ją lankytojai matys pirmą visų veiklų sąraše.`}
                className="sm:col-span-2"
              >
                <PhotoUploader id="f-photos" photos={photos} onChange={setPhotos} />
              </Field>
            </Section>

            <Section title="Kontaktai" step={7}>
              <Field
                label="Vadovo vardas ir pavardė"
                htmlFor="f-contactName"
                error={errors.contactName}
                className="sm:col-span-2"
              >
                <Input {...text("contactName")} autoComplete="name" maxLength={100} />
              </Field>
              <Field label="Telefonas" htmlFor="f-phone" error={errors.phone}>
                <Input
                  {...text("phone")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+370 600 00000"
                  maxLength={30}
                />
              </Field>
              <Field label="El. paštas" htmlFor="f-email" error={errors.email}>
                <Input {...text("email")} type="email" autoComplete="email" maxLength={255} />
              </Field>
              <Field
                label="Svetainė arba socialinis tinklas (rekomenduojame)"
                htmlFor="f-website"
                error={errors.website}
                hint="Jūsų svetainės, Facebook arba Instagram nuoroda"
                className="sm:col-span-2"
              >
                <Input
                  {...text("website")}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="pvz. facebook.com/jusupuslapis"
                  maxLength={200}
                />
              </Field>
            </Section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              {!editing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setValues(EMPTY);
                    setPhotos([]);
                    setPerks([]);
                    setWeek({});
                    setFlexible(false);
                    setScheduleError(undefined);
                    setErrors({});
                  }}
                >
                  Išvalyti
                </Button>
              )}
              <Button type="button" variant="outline" size="xl" onClick={openPreview}>
                <Eye /> Peržiūrėti, kaip atrodo kitiems
              </Button>
              <Button type="submit" size="xl" variant="teal" disabled={publishing}>
                {editing ? <Save /> : <Plus />} {publishing ? "Saugoma..." : publishLabel}
              </Button>
            </div>
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-sm font-semibold">Tiesioginė peržiūra</p>
              <p className="mb-3 text-xs text-muted-foreground">
                Kortelė keičiasi, kol pildote formą.
              </p>
              {/* `inert`: a preview only, so the card's link and heart must not respond. */}
              <div inert className="rounded-2xl border bg-card p-3 shadow-card">
                <ListingCard listing={draft} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
