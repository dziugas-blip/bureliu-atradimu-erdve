import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection, OwnerContact } from "@/components/site/LegalPage";

export const Route = createFileRoute("/taisykles")({
  head: () => ({
    meta: [
      { title: "Naudojimo taisyklės – Veiklų Pasaulis" },
      {
        name: "description",
        content: "Veiklų Pasaulio naudojimo taisyklės lankytojams ir veiklų vadovams.",
      },
      { property: "og:title", content: "Naudojimo taisyklės – Veiklų Pasaulis" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      title="Naudojimo taisyklės"
      intro="Naudodamiesi svetaine sutinkate su šiomis taisyklėmis. Jos trumpos, perskaitykite."
    >
      <LegalSection title="1. Kas yra Veiklų Pasaulis">
        <p>
          Veiklų Pasaulis yra veiklų vaikams ir suaugusiems katalogas. Veiklas skelbia jų vadovai.
          Mes patys veiklų neorganizuojame ir nesame susitarimo tarp lankytojo ir vadovo šalis.
        </p>
      </LegalSection>

      <LegalSection title="2. Lankytojams">
        <ul>
          <li>Ieškoti veiklų ir jas išsaugoti galima nemokamai ir be paskyros.</li>
          <li>
            Kainą, tvarkaraštį ir kitą informaciją nurodo veiklos vadovas. Ji gali pasikeisti, todėl
            prieš užsirašydami pasitikslinkite tiesiogiai su vadovu.
          </li>
          <li>
            Dėl užsiėmimų, apmokėjimo ir vietų susitariate su vadovu. Prieš užrašydami vaiką patys
            įsitikinkite, kad veikla ir jos vadovas jums tinka.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Veiklų vadovams">
        <ul>
          <li>Paskyrą gali kurti pilnamečiai asmenys ir juridinių asmenų atstovai.</li>
          <li>
            Skelbkite tik tikras veiklas ir teisingą informaciją. Pasikeitus kainai, laikui ar
            vietai, skelbimą atnaujinkite.
          </li>
          <li>
            Kelkite tik tas nuotraukas, kurias turite teisę naudoti. Jei nuotraukose matomi vaikai,
            turite turėti jų tėvų ar globėjų sutikimą.
          </li>
          <li>
            Draudžiama skelbti neteisėtą, klaidinantį, įžeidžiantį turinį ir veiklas, kurioms
            vykdyti neturite reikiamų leidimų.
          </li>
          <li>
            Skelbime nurodyti kontaktai yra vieši. Daugiau apie duomenis skaitykite{" "}
            <Link to="/privatumo-politika">privatumo politikoje</Link>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Turinio šalinimas">
        <p>
          Galime pašalinti skelbimą ar paskyrą, jei jie pažeidžia šias taisykles ar įstatymus. Jei
          matote netinkamą skelbimą, praneškite mums per <Link to="/pagalba">pagalbos</Link>{" "}
          puslapį.
        </p>
      </LegalSection>

      <LegalSection title="5. Atsakomybė">
        <p>
          Stengiamės, kad svetainė veiktų be sutrikimų, bet to garantuoti negalime. Už skelbimų
          turinį, veiklų kokybę, saugumą ir vadovų įsipareigojimų vykdymą atsako patys veiklų
          vadovai.
        </p>
      </LegalSection>

      <LegalSection title="6. Kaina">
        <p>Šiuo metu naudotis svetaine ir skelbti veiklas nemokama.</p>
      </LegalSection>

      <LegalSection title="7. Taisyklių keitimas ir taikoma teisė">
        <p>
          Taisykles galime keisti. Atnaujinta versija skelbiama šiame puslapyje kartu su data.
          Taisyklėms taikoma Lietuvos Respublikos teisė.
        </p>
      </LegalSection>

      <LegalSection title="8. Kontaktai">
        <OwnerContact />
      </LegalSection>
    </LegalPage>
  );
}
