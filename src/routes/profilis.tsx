import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthReady, useAuthUser, useSignedIn } from "@/lib/auth-store";
import { uploadPhoto } from "@/lib/photo-upload";
import { MyListings } from "@/components/site/MyListings";
import {
  saveProfile,
  useOrganizerProfile,
  useProfile,
  type OrganizerProfile,
} from "@/lib/profile-store";

export const Route = createFileRoute("/profilis")({
  head: () => ({
    meta: [
      { title: "Mano profilis – Veiklų Pasaulis" },
      { name: "description", content: "Veiklų vadovo profilio redagavimas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProfile,
});

function EditProfile() {
  const signedIn = useSignedIn();
  const ready = useAuthReady();
  const user = useAuthUser();
  // undefined while the saved profile is still loading.
  const loaded = useOrganizerProfile(user?.id ?? null) !== undefined;
  const stored = useProfile();
  const [draft, setDraft] = useState<OrganizerProfile>(stored);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // The saved profile arrives from the database after the page opens; pick it up then.
  useEffect(() => setDraft(stored), [stored]);

  const set = <K extends keyof OrganizerProfile>(key: K, value: OrganizerProfile[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      set("photo", await uploadPhoto(file, 480, 0.8));
    } catch {
      toast.error("Nuotraukos įkelti nepavyko", {
        description: "Patikrinkite, ar tai nuotraukos failas, ir interneto ryšį.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const name = draft.name.trim();
    if (name.length < 2) {
      setNameError("Įveskite vardą ir pavardę");
      document.getElementById("p-name")?.focus();
      return;
    }
    setNameError(undefined);
    setSaving(true);
    const { error } = await saveProfile({
      ...draft,
      name,
      headline: draft.headline.trim(),
      bio: draft.bio.trim(),
    });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Profilis išsaugotas");
  }

  if (!ready || (signedIn && !loaded)) return <div className="min-h-[60vh] bg-hero-wash" />;
  if (!signedIn) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-extrabold">Profilis skirtas veiklų vadovams</h1>
        <p className="mt-2 text-muted-foreground">Prisijunkite, kad galėtumėte jį redaguoti.</p>
        <Button className="mt-6" asChild>
          <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
            Prisijungti
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-hero-wash">
      <div className="container-page max-w-2xl pt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Mano profilis</h1>
            <p className="mt-2 text-muted-foreground">
              Tai mato lankytojai, paspaudę jūsų vardą veiklos puslapyje.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/vadovai/$id" params={{ id: user?.id ?? "" }}>
              Peržiūrėti viešą profilį
            </Link>
          </Button>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 space-y-5 rounded-2xl border bg-card p-5 shadow-card sm:p-7"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground">
              {draft.photo ? (
                <img src={draft.photo} alt="" className="size-full object-cover" />
              ) : (
                <UserRound className="size-8" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPhoto}
                aria-label="Profilio nuotrauka"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus />{" "}
                {uploading
                  ? "Įkeliama..."
                  : draft.photo
                    ? "Pakeisti nuotrauką"
                    : "Įkelti nuotrauką"}
              </Button>
              {draft.photo && (
                <Button type="button" variant="ghost" onClick={() => set("photo", "")}>
                  <X /> Pašalinti
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-name">Vardas ir pavardė</Label>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
              maxLength={100}
              aria-invalid={!!nameError}
              className={nameError ? "border-destructive" : undefined}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
            <div className="space-y-1.5">
              <Label htmlFor="p-headline">Trumpai apie jus (rekomenduojame)</Label>
              <Input
                id="p-headline"
                value={draft.headline}
                onChange={(e) => set("headline", e.target.value)}
                placeholder="pvz. Krepšinio treneris"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-age">Amžius</Label>
              <Input
                id="p-age"
                value={draft.age}
                onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 2))}
                inputMode="numeric"
                placeholder="35"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-bio">Aprašymas (rekomenduojame)</Label>
            <Textarea
              id="p-bio"
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={7}
              placeholder="pvz. 12 metų krepšinio trenerio patirtis, buvęs žaidėjas. Treniruoju vaikus nuo 6 metų, daug dėmesio skiriu technikai ir komandiniam žaidimui."
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              Kas jūs, ką veikiate, kokia jūsų patirtis ir kodėl tai darote.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={saving || uploading}>
              {saving ? "Saugoma..." : "Išsaugoti profilį"}
            </Button>
          </div>
        </form>

        <MyListings />
      </div>
    </div>
  );
}
