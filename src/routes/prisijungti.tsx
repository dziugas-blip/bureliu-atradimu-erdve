import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";
import { Logo } from "@/components/site/Logo";
import { signIn, signUp } from "@/lib/auth-store";
import { saveProfile } from "@/lib/profile-store";

export const Route = createFileRoute("/prisijungti")({
  validateSearch: zodValidator(
    z.object({ tab: fallback(z.string(), "prisijungti").default("prisijungti") }),
  ),
  head: () => ({
    meta: [
      { title: "Prisijungti arba registruotis – Veiklų Erdvė" },
      { name: "description", content: "Veiklų vadovų prisijungimas ir registracija." },
      { property: "og:title", content: "Prisijungti arba registruotis – Veiklų Erdvė" },
      { property: "og:description", content: "Veiklų vadovų prisijungimas ir registracija." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/prisijungti" });
  const active = tab === "registruotis" ? "registruotis" : "prisijungti";

  // Accounts are for organisers, so signing in leads straight to the add-activity form.
  const goOn = () => void navigate({ to: "/ideti" });

  const [pending, setPending] = useState(false);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    const { error } = await signIn({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setPending(false);
    if (error) toast.error(error);
    else goOn();
  };
  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    setPending(true);
    const result = await signUp({
      name,
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (name) saveProfile({ name });
    if (result.needsConfirmation) {
      toast.success("Patikrinkite el. paštą", {
        description: "Atsiuntėme laišką su nuoroda. Paspaudę ją galėsite įdėti veiklą.",
        duration: 15000,
      });
      return;
    }
    goOn();
  };

  return (
    <div className="bg-hero-wash">
      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-float sm:p-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-5 text-center text-xl font-extrabold">Veiklų vadovams</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Paskyros reikia tik tiems, kas deda veiklas. Ieškoti veiklų ir jas išsaugoti galima be
            paskyros.
          </p>
          <Tabs
            value={active}
            onValueChange={(v) => navigate({ search: { tab: v }, replace: true })}
            className="mt-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prisijungti">Prisijungti</TabsTrigger>
              <TabsTrigger value="registruotis">Registruotis</TabsTrigger>
            </TabsList>

            <TabsContent value="prisijungti">
              <GoogleSignInButton className="mt-4" onSignedIn={goOn} />
              <form onSubmit={onLogin} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">El. paštas</Label>
                  <Input id="login-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-pass">Slaptažodis</Label>
                  <Input
                    id="login-pass"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  Prisijungti
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="registruotis">
              <GoogleSignInButton className="mt-4" onSignedIn={goOn} />
              <form onSubmit={onRegister} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Vardas ir pavardė</Label>
                  <Input id="reg-name" name="name" autoComplete="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">El. paštas</Label>
                  <Input id="reg-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass">Slaptažodis</Label>
                  <Input
                    id="reg-pass"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  Sukurti vadovo paskyrą
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
