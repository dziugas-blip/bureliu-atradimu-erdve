import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection, OwnerContact } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privatumo-politika")({
  head: () => ({
    meta: [
      { title: "Privatumo politika – Veiklų Pasaulis" },
      {
        name: "description",
        content:
          "Kokius asmens duomenis renka Veiklų Pasaulis, kam juos naudoja ir kokios jūsų teisės.",
      },
      { property: "og:title", content: "Privatumo politika – Veiklų Pasaulis" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      title="Privatumo politika"
      intro="Čia paprastai paaiškiname, kokius jūsų duomenis renkame, kam jų reikia ir ką galite su jais daryti."
    >
      <LegalSection title="1. Kas tvarko jūsų duomenis">
        <OwnerContact />
      </LegalSection>

      <LegalSection title="2. Kokius duomenis renkame">
        <p>
          <strong>Jei tik ieškote veiklų</strong>, paskyros jums nereikia ir asmens duomenų iš jūsų
          neprašome. Mėgstamų veiklų sąrašas saugomas tik jūsų naršyklėje ir mūsų nepasiekia.
        </p>
        <p>
          <strong>Jei rašote veiklos vadovui arba mums</strong>, gauname tai, ką įrašote formoje:
          vardą, el. pašto adresą, telefono numerį (jei jį nurodote) ir žinutę.
        </p>
        <p>
          <strong>Jei esate veiklų vadovas</strong>, tvarkome:
        </p>
        <ul>
          <li>
            paskyros duomenis: vardą, el. pašto adresą ir slaptažodį. Slaptažodis saugomas
            užšifruotas, jo nematome. Jungiantis su „Google“, iš jos gauname jūsų vardą ir el. pašto
            adresą;
          </li>
          <li>
            veiklos skelbimo duomenis: pavadinimą, aprašymą, adresą, tvarkaraštį, kainą, nuotraukas,
            kontaktinio asmens vardą, telefoną ir el. paštą;
          </li>
          <li>profilio duomenis, jei juos užpildote: nuotrauką, aprašymą ir amžių.</li>
        </ul>
        <p>
          Skelbimo ir profilio duomenys yra <strong>vieši</strong>: juos mato visi svetainės
          lankytojai. Nurodykite tik tuos kontaktus, kuriuos norite skelbti viešai.
        </p>
      </LegalSection>

      <LegalSection title="3. Kam duomenis naudojame">
        <ul>
          <li>paskyrai sukurti ir jums prisijungti (sutarties su jumis vykdymas);</li>
          <li>jūsų veikloms paskelbti ir parodyti lankytojams (sutarties vykdymas);</li>
          <li>
            lankytojo užklausai perduoti veiklos vadovui ir atsakyti į jūsų klausimus (mūsų ir jūsų
            teisėtas interesas susisiekti);
          </li>
          <li>svetainės saugumui ir sutrikimų šalinimui (teisėtas interesas).</li>
        </ul>
        <p>Jūsų duomenų neparduodame ir nenaudojame reklamai.</p>
      </LegalSection>

      <LegalSection title="4. Kas dar gauna duomenis">
        <ul>
          <li>
            <strong>Veiklų vadovai</strong> gauna užklausas, kurias jiems siunčiate per veiklos
            puslapį.
          </li>
          <li>
            <strong>Prieglobos ir duomenų bazės paslaugų teikėjas</strong> („Lovable Cloud“,
            veikianti „Supabase“ pagrindu) saugo paskyras ir skelbimus.
          </li>
          <li>
            <strong>„Google“</strong>: jei jungiatės su „Google“ paskyra. Be to, svetainės šriftai
            įkeliami iš „Google Fonts“, todėl jūsų naršyklė kreipiasi į „Google“ serverius.
          </li>
          <li>
            <strong>„OpenStreetMap“</strong>: žemėlapio vaizdas įkeliamas iš jos serverių, todėl ji
            mato jūsų IP adresą. Vadovui išsaugant veiklą, jos adresas siunčiamas šiai tarnybai, kad
            rastume vietą žemėlapyje.
          </li>
        </ul>
        <p>
          Kai kurie šių teikėjų gali tvarkyti duomenis už Europos ekonominės erdvės ribų. Tokiais
          atvejais taikomos Europos Komisijos patvirtintos standartinės sutarčių sąlygos.
        </p>
      </LegalSection>

      <LegalSection title="5. Kiek laiko saugome">
        <ul>
          <li>Paskyros, skelbimų ir profilio duomenis saugome, kol turite paskyrą.</li>
          <li>Skelbimą ar profilio duomenis galite bet kada pakeisti ar ištrinti patys.</li>
          <li>
            Paskyrą galite ištrinti patys puslapyje „Mano profilis“. Kartu ištrinamos jūsų veiklos,
            nuotraukos ir profilis.
          </li>
          <li>Užklausas ir susirašinėjimą saugome tiek, kiek reikia į juos atsakyti.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Jūsų teisės">
        <p>Turite teisę:</p>
        <ul>
          <li>sužinoti, kokius jūsų duomenis tvarkome, ir gauti jų kopiją;</li>
          <li>prašyti ištaisyti netikslius duomenis;</li>
          <li>prašyti ištrinti duomenis arba apriboti jų tvarkymą;</li>
          <li>nesutikti su tvarkymu, kai jis grindžiamas teisėtu interesu;</li>
          <li>gauti savo duomenis perkeliamu formatu.</li>
        </ul>
        <p>
          Dėl šių teisių parašykite 1 punkte nurodytu adresu. Jei manote, kad jūsų duomenis tvarkome
          netinkamai, galite pateikti skundą Valstybinei duomenų apsaugos inspekcijai (
          <a href="https://vdai.lrv.lt" target="_blank" rel="noreferrer noopener">
            vdai.lrv.lt
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="7. Slapukai ir naršyklės atmintis">
        <p>
          Reklamos ir lankomumo sekimo slapukų nenaudojame. Jūsų naršyklėje saugome tik tai, be ko
          svetainė neveiktų:
        </p>
        <ul>
          <li>prisijungimo būseną, kad vadovui nereikėtų jungtis kaskart iš naujo;</li>
          <li>jūsų mėgstamų veiklų sąrašą.</li>
        </ul>
        <p>Dėl to sutikimo su slapukais juostos nerodome.</p>
      </LegalSection>

      <LegalSection title="8. Pakeitimai">
        <p>
          Pasikeitus tam, kaip tvarkome duomenis, atnaujinsime šį puslapį ir jo datą. Naudojimosi
          svetaine sąlygas rasite <Link to="/taisykles">naudojimo taisyklėse</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
