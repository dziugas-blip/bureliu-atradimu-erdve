import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatPrice, listingImage } from "@/lib/listings";
import { deleteListing, useListings } from "@/lib/listings-store";
import { formatPlace } from "@/lib/places";

/** The organiser's own activities, each with edit and delete. */
export function MyListings() {
  // Every listing added from this browser belongs to the organiser using it.
  const mine = useListings().filter((l) => l.userSubmitted);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">
            Mano veiklos <span className="text-muted-foreground">({mine.length})</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Čia galite redaguoti arba ištrinti savo įdėtas veiklas.
          </p>
        </div>
        <Button variant="teal" asChild>
          <Link to="/ideti">
            <Plus /> Įdėti veiklą
          </Link>
        </Button>
      </div>

      {mine.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
          Dar neįdėjote nė vienos veiklos.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {mine.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-3 shadow-card"
            >
              <img
                src={listingImage(l)}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/bureliai/$id"
                  params={{ id: l.id }}
                  className="block truncate font-bold hover:text-primary"
                >
                  {l.title}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {l.category} · {formatPlace(l)} · {formatPrice(l.price)} / mėn.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/redaguoti/$id" params={{ id: l.id }}>
                    <Pencil /> Redaguoti
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 /> Ištrinti
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ištrinti šią veiklą?</AlertDialogTitle>
                      <AlertDialogDescription>
                        „{l.title.replace(/[„“]/g, "")}“ dings iš veiklų sąrašo. Šio veiksmo
                        atšaukti negalėsite.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteListing(l.id);
                          toast.success("Veikla ištrinta");
                        }}
                      >
                        Ištrinti
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
