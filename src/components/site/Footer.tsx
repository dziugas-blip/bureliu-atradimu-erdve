import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Būrelių katalogas vaikams ir suaugusiems visoje Lietuvoje. Pradedame nuo Vilniaus.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Ieškantiems</p>
            <Link to="/bureliai" search={{}} className="block text-muted-foreground hover:text-foreground">
              Visi būreliai
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Būrelių vadovams</p>
            <Link to="/ideti" className="block text-muted-foreground hover:text-foreground">
              Įdėti būrelį
            </Link>
            <Link
              to="/prisijungti"
              search={{ tab: "registruotis" }}
              className="block text-muted-foreground hover:text-foreground"
            >
              Registruotis
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="container-page py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Būrelių Erdvė. Visos teisės saugomos.
        </p>
      </div>
    </footer>
  );
}
