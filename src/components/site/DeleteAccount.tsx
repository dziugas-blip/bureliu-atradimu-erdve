import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteMyAccount } from "@/lib/account";
import { SITE_OWNER } from "@/lib/site-info";

/** "Delete account" section for the organiser's profile page, with a confirmation step. */
export function DeleteAccount() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    const result = await deleteMyAccount();
    setDeleting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    if (result.loginDeleted) {
      toast.success("Paskyra ištrinta", { description: "Visi jūsų duomenys pašalinti." });
    } else {
      toast.success("Jūsų veiklos, nuotraukos ir profilis ištrinti", {
        description: `Norėdami, kad ištrintume ir prisijungimo duomenis, parašykite ${SITE_OWNER.email}.`,
        duration: 15000,
      });
    }
    void navigate({ to: "/" });
  }

  return (
    <section className="mt-12 rounded-2xl border border-destructive/30 bg-card p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">Ištrinti paskyrą</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Bus ištrintos visos jūsų veiklos, nuotraukos ir profilis. Šio veiksmo atšaukti negalėsite.
      </p>
      <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="mt-4 text-destructive">
            <Trash2 /> Ištrinti paskyrą
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tikrai ištrinti paskyrą?</AlertDialogTitle>
            <AlertDialogDescription>
              Visos jūsų veiklos dings iš svetainės, bus ištrintos jūsų nuotraukos ir profilis.
              Atkurti jų nebus galima.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Atšaukti</AlertDialogCancel>
            {/* A plain button, not AlertDialogAction, so the dialog stays open while deleting. */}
            <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
              {deleting ? "Trinama..." : "Taip, ištrinti"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
