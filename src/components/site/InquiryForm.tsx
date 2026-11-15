import { CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Įveskite vardą").max(100, "Per ilgas vardas"),
  email: z.string().trim().email("Neteisingas el. pašto adresas").max(255),
  phone: z
    .string()
    .trim()
    .max(30, "Per ilgas numeris")
    .regex(/^[+\d\s()-]*$/, "Neteisingas telefono numeris"),
  message: z.string().trim().min(10, "Žinutė per trumpa").max(1000, "Žinutė per ilga"),
});

type Values = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Values, string>>;

export function InquiryForm({ listingTitle }: { listingTitle: string }) {
  const empty: Values = {
    name: "",
    email: "",
    phone: "",
    message: `Sveiki, norėčiau daugiau sužinoti apie „${listingTitle.replace(/[„“]/g, "")}“. Ar dar yra laisvų vietų?`,
  };
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof Values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values;
        errs[key] ??= issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
    toast.success("Užklausa išsiųsta!", {
      description: "Veiklos vadovas susisieks su jumis artimiausiu metu.",
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-teal-soft p-5 text-center">
        <CheckCircle2 className="mx-auto size-8 text-teal" />
        <p className="mt-2 font-bold">Ačiū, užklausa išsiųsta!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Veiklos vadovas atsakys nurodytu el. paštu.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => {
            setValues(empty);
            setSent(false);
          }}
        >
          Rašyti dar kartą
        </Button>
      </div>
    );
  }

  const field = (k: keyof Values) => ({
    id: `inq-${k}`,
    value: values[k],
    onChange: set(k),
    "aria-invalid": !!errors[k],
    className: errors[k] ? "border-destructive" : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="inq-name">Vardas</Label>
        <Input {...field("name")} autoComplete="name" maxLength={100} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-email">El. paštas</Label>
        <Input {...field("email")} type="email" autoComplete="email" maxLength={255} />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-phone">
          Telefonas <span className="font-normal text-muted-foreground">(rekomenduojame)</span>
        </Label>
        <Input {...field("phone")} type="tel" autoComplete="tel" maxLength={30} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Žinutė</Label>
        <Textarea {...field("message")} rows={4} maxLength={1000} />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full">
        <Send /> Siųsti užklausą
      </Button>
    </form>
  );
}
