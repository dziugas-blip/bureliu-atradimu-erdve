import { Link } from "@tanstack/react-router";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";

const navLink =
  "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
const navActive = "text-foreground";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Pagrindinė navigacija">
            <Link to="/bureliai" search={{}} className={navLink} activeProps={{ className: navActive }}>
              Visi būreliai
            </Link>
            <Link to="/ideti" className={navLink} activeProps={{ className: navActive }}>
              Įdėti būrelį
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
              Prisijungti
            </Link>
          </Button>
          <Button asChild>
            <Link to="/prisijungti" search={{ tab: "registruotis" }}>
              Registruotis
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Atidaryti meniu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle className="text-left">Meniu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1" onClick={() => setOpen(false)}>
              <Link to="/bureliai" search={{}} className={navLink}>
                Visi būreliai
              </Link>
              <Link to="/ideti" className={navLink}>
                Įdėti būrelį
              </Link>
              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                <Button variant="outline" asChild>
                  <Link to="/prisijungti" search={{ tab: "prisijungti" }}>
                    Prisijungti
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/prisijungti" search={{ tab: "registruotis" }}>
                    Registruotis
                  </Link>
                </Button>
                <Button variant="teal" asChild>
                  <Link to="/ideti">
                    <Plus /> Įdėti būrelį
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
