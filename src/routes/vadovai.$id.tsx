import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { ListingCard } from "@/components/site/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/lib/auth-store";
import { useListings, useListingsReady } from "@/lib/listings-store";
import { organizerIdOf, useOrganizerProfile } from "@/lib/profile-store";

export const Route = createFileRoute("/vadovai/$id")({
  head: () => ({
    meta: [
      { title: "Veiklų vadovas – Veiklų Pasaulis" },
      { name: "description", content: "Veiklų vadovo aprašymas ir jo vedamos veiklos." },
    ],
  }),
  component: OrganizerPage,
});

function OrganizerPage() {
  const { id } = Route.useParams();
  const listingsReady = useListingsReady();
  const user = useAuthUser();
  const activities = useListings().filter((l) => organizerIdOf(l) === id);
  // undefined while loading; null for sample organisers and those without a profile.
  const loadedProfile = useOrganizerProfile(id);
  const profile = loadedProfile ?? null;
  const isOwn = user !== null && user.id === id;
  const name = profile?.name || activities[0]?.contactName;

  if (!name) {
    if (!listingsReady || loadedProfile === undefined) {
      return (
        <div className="container-page space-y-4 pt-10">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      );
    }
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-extrabold">Vadovas nerastas</h1>
        <p className="mt-2 text-muted-foreground">Galbūt nuoroda klaidinga.</p>
        <Button className="mt-6" asChild>
          <Link to="/bureliai" search={{}}>
            Žiūrėti visas veiklas
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page pt-6">
      <Link
        to="/bureliai"
        search={{}}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Visos veiklos
      </Link>

      <div className="mt-6 flex flex-wrap items-start gap-5 rounded-2xl border bg-card p-6 shadow-card">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          {profile?.photo ? (
            <img src={profile.photo} alt={name} className="size-full object-cover" />
          ) : (
            <UserRound className="size-10" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted-foreground">Veiklų vadovas</p>
          <h1 className="text-3xl font-extrabold">{name}</h1>
          {(profile?.headline || profile?.age) && (
            <p className="mt-1 text-muted-foreground">
              {[profile.headline, profile.age && `${profile.age} m.`].filter(Boolean).join(" · ")}
            </p>
          )}
          {profile?.bio ? (
            <p className="mt-4 max-w-2xl whitespace-pre-line leading-relaxed text-foreground/85">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Vadovas dar neparašė apie save.</p>
          )}
        </div>
        {isOwn && (
          <Button variant="outline" asChild>
            <Link to="/profilis">Redaguoti profilį</Link>
          </Button>
        )}
      </div>

      <h2 className="mt-10 text-xl font-extrabold">
        Vadovo veiklos <span className="text-muted-foreground">({activities.length})</span>
      </h2>
      {activities.length > 0 ? (
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activities.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Šis vadovas dar neįdėjo veiklų.</p>
      )}
    </div>
  );
}
