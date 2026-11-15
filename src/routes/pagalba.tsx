import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/pagalba")({
  head: () => ({
    meta: [
      { title: "Pagalba – Veiklų Pasaulis" },
      {
        name: "description",
        content:
          "Atsakymai į dažniausius klausimus ir galimybė susisiekti su Veiklų Pasaulio komanda.",
      },
      { property: "og:title", content: "Pagalba – Veiklų Pasaulis" },
      {
        property: "og:description",
        content: "Atsakymai į dažniausius klausimus ir galimybė susisiekti.",
      },
    ],
  }),
  component: Help,
});

const FAQ: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "Ieškantiems veiklų",
    items: [
      {
        q: "Ar naudotis Veiklų Pasauliu kainuoja?",
        a: "Ne. Ieškoti veiklų ir jas išsaugoti galima nemokamai ir be paskyros. Už pačią veiklą mokate tiesiogiai jos vadovui.",
      },
      {
        q: "Kaip užsirašyti į veiklą?",
        a: "Atidarykite veiklos puslapį ir parašykite vadovui per formą „Susisiekti su veiklos vadovu“ arba paskambinkite nurodytu numeriu. Dėl vietų ir pirmo užsiėmimo susitariate tiesiogiai su vadovu.",
      },
      {
        q: "Ką reiškia ženkliukas „NVŠ krepšelis“?",
        a: "Tai neformaliojo vaikų švietimo krepšelis – valstybės skiriamos lėšos vaiko užsiėmimams. Ženkliukas rodo, kad šiai veiklai krepšelį galima pritaikyti. Tikslią sumą ir tvarką pasitikslinkite pas vadovą arba savo savivaldybėje.",
      },
      {
        q: "Kaip išsaugoti patikusias veiklas?",
        a: "Paspauskite širdutę ant veiklos. Visos išsaugotos veiklos yra skiltyje „Mėgstamos“. Sąrašas saugomas jūsų naršyklėje, todėl kitame įrenginyje jo nematysite.",
      },
    ],
  },
  {
    heading: "Veiklų vadovams",
    items: [
      {
        q: "Kaip įdėti savo veiklą?",
        a: "Paspauskite „Įdėti veiklą“, prisiregistruokite kaip vadovas ir užpildykite formą. Veikla sąraše atsiranda iškart.",
      },
      {
        q: "Kiek kainuoja įdėti veiklą?",
        a: "Įdėti veiklą nemokama.",
      },
      {
        q: "Kaip pakeisti arba pašalinti savo veiklą?",
        a: "Kol kas to padaryti pačiam negalima. Parašykite mums per žemiau esančią formą, nurodykite veiklos pavadinimą ir ką reikia pakeisti.",
      },
      {
        q: "Kam reikalingas vadovo profilis?",
        a: "Lankytojai, paspaudę jūsų vardą veiklos puslapyje, mato jūsų nuotrauką ir aprašymą. Užpildytas profilis kelia pasitikėjimą. Jį rasite meniu „Mano profilis“.",
      },
    ],
  },
];

const schema = z.object({
  name: z.string().trim().min(2, "Įveskite vardą").max(100, "Per ilgas vardas"),
  email: z.string().trim().email("Neteisingas el. pašto adresas").max(255),
  message: z.string().trim().min(10, "Žinutė per trumpa").max(2000, "Žinutė per ilga"),
});
type Values = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Values, string>>;
const EMPTY: Values = { name: "", email: "", message: "" };

function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

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
      document.getElementById(`help-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-teal-soft p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-teal" />
        <p className="mt-2 font-bold">Ačiū už žinutę!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bandomoji versija: žinutė kol kas niekur neišsiųsta.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => {
            setValues(EMPTY);
            setSent(false);
          }}
        >
          Rašyti dar kartą
        </Button>
      </div>
    );
  }

  const field = (k: keyof Values) => ({
    id: `help-${k}`,
    value: values[k],
    onChange: (e: { target: { value: string } }) =>
      setValues((v) => ({ ...v, [k]: e.target.value })),
    "aria-invalid": !!errors[k],
    className: errors[k] ? "border-destructive" : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="help-name">Vardas</Label>
          <Input {...field("name")} autoComplete="name" maxLength={100} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="help-email">El. paštas</Label>
          <Input {...field("email")} type="email" autoComplete="email" maxLength={255} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="help-message">Jūsų klausimas</Label>
        <Textarea {...field("message")} rows={5} maxLength={2000} />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg">
        <Send /> Siųsti žinutę
      </Button>
      <p className="text-xs text-muted-foreground">
        Bandomoji versija: žinutės kol kas niekur nesiunčiamos.
      </p>
    </form>
  );
}

function Help() {
  return (
    <div className="container-page max-w-3xl pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Pagalba</h1>
      <p className="mt-2 text-muted-foreground">
        Atsakymai į dažniausius klausimus. Jei savo klausimo nerandate, parašykite mums žemiau.
      </p>

      {FAQ.map((group) => (
        <section key={group.heading} className="mt-10">
          <h2 className="text-xl font-extrabold">{group.heading}</h2>
          <Accordion type="single" collapsible className="mt-3 rounded-2xl border bg-card px-5">
            {group.items.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="last:border-b-0">
                <AccordionTrigger className="text-left text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}

      <section id="susisiekti" className="mt-12 rounded-2xl border bg-card p-5 shadow-card sm:p-7">
        <h2 className="text-xl font-extrabold">Neradote atsakymo? Parašykite mums</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          Atsakysime el. paštu kaip galėdami greičiau.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}
