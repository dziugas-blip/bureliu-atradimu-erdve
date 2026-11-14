import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/prisijungti")({
  validateSearch: zodValidator(
    z.object({ tab: fallback(z.string(), "prisijungti").default("prisijungti") }),
  ),
  head: () => ({
    meta: [
      { title: "Prisijungti arba registruotis – Būrelių Erdvė" },
      { name: "description", content: "Prisijunkite arba susikurkite Būrelių Erdvė paskyrą." },
      { property: "og:title", content: "Prisijungti arba registruotis – Būrelių Erdvė" },
      { property: "og:description", content: "Prisijunkite arba susikurkite Būrelių Erdvė paskyrą." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/prisijungti" });
  const active = tab === "registruotis" ? "registruotis" : "prisijungti";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.info("Paskyros jau netrukus!", {
      description: "Prisijungimo funkcija šiuo metu kuriama.",
    });
  };

  return (
    <div className="bg-hero-wash">
      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-float sm:p-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <Tabs
            value={active}
            onValueChange={(v) => navigate({ search: { tab: v }, replace: true })}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prisijungti">Prisijungti</TabsTrigger>
              <TabsTrigger value="registruotis">Registruotis</TabsTrigger>
            </TabsList>
            <TabsContent value="prisijungti">
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">El. paštas</Label>
                  <Input id="login-email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-pass">Slaptažodis</Label>
                  <Input id="login-pass" type="password" autoComplete="current-password" required />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Prisijungti
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="registruotis">
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Vardas</Label>
                  <Input id="reg-name" autoComplete="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">El. paštas</Label>
                  <Input id="reg-email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass">Slaptažodis</Label>
                  <Input id="reg-pass" type="password" autoComplete="new-password" minLength={8} required />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Sukurti paskyrą
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
