import { Link } from "@tanstack/react-router";
import { Heart, LogOut, Menu, Plus, UserRound } from "lucide-react";
import { signOut, useSignedIn } from "@/lib/auth-store";
import { useFavorites } from "@/lib/favorites-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";

const navLink =
  "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
const navActive = "text-foreground";

export function Header() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const favoriteCount = useFavorites().length;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Pagrindinė navigacija">
            <Link
              to="/bureliai"
              search={{}}
              className={navLink}
              activeProps={{ className: navActive }}
            >
              Visos veiklos
            </Link>
            <Link to="/ideti" className={navLink} activeProps={{ className: navActive }}>
              Įdėti veiklą
            </Link>
            <Link to="/zemelapis" className={navLink} activeProps={{ className: navActive }}>
              Veiklų žemėlapis
            </Link>
            <Link to="/tinklarastis" className={navLink} activeProps={{ className: navActive }}>
              Tinklaraštis
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/megstami" aria-label={`Mano mėgstamos veiklos (${favoriteCount})`}>
              <Heart className={favoriteCount > 0 ? "fill-current text-rose-600" : undefined} />
              Mėgstamos
              {favoriteCount > 0 && (
                <span className="rounded-full bg-primary-soft px-1.5 text-xs font-bold text-primary">
                  {favoriteCount}
                </span>
              )}
            </Link>
          </Button>
          {signedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/profilis">
                  <UserRound /> Mano profilis
                </Link>
              </Button>
              <Button variant="outline" onClick={() => void signOut()}>
                <LogOut /> Atsijungti
              </Button>
            </>
          ) : (
            <>
              {/* The divider sets the organiser sign-in apart from what visitors use. */}
              <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              <Button variant="outline" asChild>
                <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
                  <UserRound /> Vadovams: prisijungti
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Atidaryti meniu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle className="text-left">Meniu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1" onClick={() => setOpen(false)}>
              <Link to="/bureliai" search={{}} className={navLink}>
                Visos veiklos
              </Link>
              <Link to="/ideti" className={navLink}>
                Įdėti veiklą
              </Link>
              <Link to="/zemelapis" className={navLink}>
                Veiklų žemėlapis
              </Link>
              <Link to="/tinklarastis" className={navLink}>
                Tinklaraštis
              </Link>
              <Link to="/megstami" className={navLink}>
                Mano mėgstamos veiklos{favoriteCount > 0 && ` (${favoriteCount})`}
              </Link>
              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                {signedIn ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/profilis">
                        <UserRound /> Mano profilis
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => void signOut()}>
                      <LogOut /> Atsijungti
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
                      <UserRound /> Vadovams: prisijungti
                    </Link>
                  </Button>
                )}
                <Button variant="teal" asChild>
                  <Link to="/ideti">
                    <Plus /> Įdėti veiklą
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
