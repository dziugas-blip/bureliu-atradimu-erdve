import { Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Veiklų katalogas vaikams ir suaugusiems visoje Lietuvoje.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-x-12 gap-y-6 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Kilo klausimų?</p>
            <Button size="lg" asChild>
              <Link to="/pagalba">
                <LifeBuoy /> Pagalba
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Ieškantiems</p>
            <Link
              to="/bureliai"
              search={{}}
              className="block text-muted-foreground hover:text-foreground"
            >
              Visos veiklos
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Veiklų vadovams</p>
            <Link to="/ideti" className="block text-muted-foreground hover:text-foreground">
              Įdėti veiklą
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="container-page py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Veiklų Erdvė. Visos teisės saugomos.
        </p>
      </div>
    </footer>
  );
}
