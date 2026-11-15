import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthReady, useSignedIn } from "@/lib/auth-store";

/** Shows its children only to a signed-in organiser; everyone else is asked to register. */
export function OrganizerGate({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  const ready = useAuthReady();

  // Wait until the stored session has been read so a signed-in organiser doesn't see the
  // gate flash.
  if (!ready) return <div className="min-h-[60vh] bg-hero-wash" />;
  if (signedIn) return children;

  return (
    <div className="bg-hero-wash">
      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-float sm:p-8">
          <h1 className="text-2xl font-extrabold">Veiklas deda vadovai</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Norėdami įdėti veiklą, prisiregistruokite kaip veiklų vadovas. Tai nemokama.
          </p>
          <Button size="lg" className="mt-6 w-full" asChild>
            <Link to="/prisijungti" search={{ tab: "registruotis" }}>
              Registruotis kaip vadovas
            </Link>
          </Button>
          <Button variant="ghost" className="mt-2 w-full" asChild>
            <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
              Jau turiu paskyrą
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
