import ballet from "@/assets/listing-ballet.jpg";
import basketball from "@/assets/listing-basketball.jpg";
import robotics from "@/assets/listing-robotics.jpg";
import painting from "@/assets/listing-painting.jpg";
import guitar from "@/assets/listing-guitar.jpg";
import english from "@/assets/listing-english.jpg";
import contemporary from "@/assets/listing-contemporary.jpg";
import football from "@/assets/listing-football.jpg";

export const AUDIENCES = ["Vaikams", "Suaugusiems"] as const;
export const AGE_GROUPS = ["3-5 m.", "6-9 m.", "10-13 m.", "14-18 m.", "Suaugusiems"] as const;
export const GENDERS = ["Berniukams", "Mergaitėms"] as const;
export const CATEGORIES = [
  "Šokiai",
  "Sportas",
  "Menai",
  "IT ir robotika",
  "Muzika",
  "Kalbos",
] as const;

/** Extras an organiser can tick. `short` is the badge text on listing cards. */
export const PERKS = [
  { id: "nvs", label: "Taikomas NVŠ krepšelis", short: "NVŠ krepšelis" },
  { id: "trial", label: "Pirmas bandomasis užsiėmimas nemokamai", short: "Bandomasis nemokamai" },
] as const;
export type PerkId = (typeof PERKS)[number]["id"];

/**
 * Turns what an organiser typed ("facebook.com/klubas") into a safe link, or null if it is not
 * a web address. Only http(s) is allowed, so a "javascript:" value can never become a link.
 */
export function normalizeWebsite(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const isWeb = url.protocol === "http:" || url.protocol === "https:";
    return isWeb && url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/** A city, town or village name from `places.ts`. */
export type City = string;
export type Category = (typeof CATEGORIES)[number];
export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Audience = (typeof AUDIENCES)[number] | "Visiems";
export type Gender = (typeof GENDERS)[number] | "Visiems";

export interface ScheduleSlot {
  day: string;
  time: string;
}

export interface Listing {
  id: string;
  title: string;
  city: City;
  /** Microdistrict. Empty when the place has none. */
  district: string;
  address: string;
  /** Map position. Sample listings carry approximate coordinates; user-added ones have none. */
  lat?: number;
  lng?: number;
  category: Category;
  audience: Audience;
  ages: AgeGroup[];
  gender: Gender;
  price: number;
  shortDescription: string;
  description: string;
  schedule: ScheduleSlot[];
  /** No fixed timetable: times are agreed with each participant. */
  scheduleFlexible?: boolean;
  /** Set on listings added by a signed-in organiser. See `organizerIdOf`. */
  organizerId?: string;
  contactName: string;
  phone: string;
  email: string;
  perks?: PerkId[];
  /** Website or social profile, already normalised to an http(s) URL. */
  website?: string;
  image?: string;
  /** Photos uploaded by the owner, as data URLs. The first one is the cover. */
  photos?: string[];
  /** True for listings stored in the database, false/absent for the built-in samples. */
  userSubmitted?: boolean;
  /** When the listing was published (ISO timestamp); drives the "Nauja" badge. */
  createdAt?: string;
}

export const ALL = "all";

export interface Filters {
  q: string;
  city: string;
  district: string;
  audience: string;
  age: string;
  gender: string;
  category: string;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  city: ALL,
  district: ALL,
  audience: ALL,
  age: ALL,
  gender: ALL,
  category: ALL,
};

export const CATEGORY_IMAGES: Record<Category, string> = {
  Šokiai: contemporary,
  Sportas: football,
  Menai: painting,
  "IT ir robotika": robotics,
  Muzika: guitar,
  Kalbos: english,
};

export function listingImage(listing: Listing): string {
  return listing.photos?.[0] ?? listing.image ?? CATEGORY_IMAGES[listing.category];
}

/** Lowercase and strip Lithuanian diacritics so "sokiai" finds "Šokiai". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterListings(listings: Listing[], filters: Filters): Listing[] {
  const query = normalizeText(filters.q.trim());

  return listings.filter((l) => {
    if (query) {
      const haystack = normalizeText(
        [l.title, l.shortDescription, l.description, l.category, l.district, l.city].join(" "),
      );
      if (!haystack.includes(query)) return false;
    }
    if (filters.city !== ALL && l.city !== filters.city) return false;
    if (filters.district !== ALL && l.district !== filters.district) return false;
    if (filters.audience !== ALL && l.audience !== "Visiems" && l.audience !== filters.audience)
      return false;
    if (filters.age !== ALL && !l.ages.includes(filters.age as AgeGroup)) return false;
    if (filters.gender !== ALL && l.gender !== "Visiems" && l.gender !== filters.gender)
      return false;
    if (filters.category !== ALL && l.category !== filters.category) return false;
    return true;
  });
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 0 }).format(price)} €`;
}

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "baleto-studija-piruetas",
    perks: ["nvs", "trial"],
    title: "Baleto studija „Piruetas“",
    city: "Vilnius",
    district: "Žvėrynas",
    address: "Vytauto g. 12, Vilnius",
    lat: 54.6905,
    lng: 25.252,
    category: "Šokiai",
    audience: "Vaikams",
    ages: ["3-5 m.", "6-9 m."],
    gender: "Mergaitėms",
    price: 65,
    shortDescription: "Klasikinio baleto pagrindai mažosioms šokėjoms jaukioje studijoje.",
    description:
      "„Piruetas“ – jauki baleto studija Žvėryne, kurioje mergaitės žingsnis po žingsnio susipažįsta su klasikinio baleto pagrindais. Užsiėmimuose lavinama laikysena, lankstumas, koordinacija ir muzikalumas. Mažose iki 10 vaikų grupėse dirba profesionalios baleto pedagogės, baigusios Lietuvos muzikos ir teatro akademiją. Kiekvieno sezono pabaigoje rengiamas atvirų durų koncertas tėveliams.",
    schedule: [
      { day: "Pirmadienis", time: "17:00 – 18:00" },
      { day: "Trečiadienis", time: "17:00 – 18:00" },
      { day: "Šeštadienis", time: "10:00 – 11:00" },
    ],
    contactName: "Rūta Kazlauskienė",
    phone: "+370 612 34567",
    email: "info@piruetas.lt",
    image: ballet,
  },
  {
    id: "krepsinio-akademija-taiklus-metimas",
    perks: ["nvs"],
    title: "Krepšinio akademija „Taiklus metimas“",
    city: "Vilnius",
    district: "Antakalnis",
    address: "Antakalnio g. 45, Vilnius",
    lat: 54.701,
    lng: 25.312,
    category: "Sportas",
    audience: "Vaikams",
    ages: ["10-13 m.", "14-18 m."],
    gender: "Berniukams",
    price: 55,
    shortDescription: "Technikos, komandinio žaidimo ir fizinio pasirengimo treniruotės.",
    description:
      "Krepšinio akademija „Taiklus metimas“ kviečia berniukus tobulinti kamuolio valdymo, metimų ir komandinio žaidimo įgūdžius. Treniruotes veda licencijuoti treneriai, buvę profesionalūs žaidėjai. Akademijos komandos dalyvauja Vilniaus moksleivių krepšinio lygoje, o vasarą organizuojamos sporto stovyklos prie jūros.",
    schedule: [
      { day: "Antradienis", time: "16:30 – 18:00" },
      { day: "Ketvirtadienis", time: "16:30 – 18:00" },
    ],
    contactName: "Tomas Petrauskas",
    phone: "+370 623 45678",
    email: "treneris@taiklusmetimas.lt",
    image: basketball,
  },
  {
    id: "robotikos-klubas-robolab",
    perks: ["nvs"],
    title: "Robotikos klubas „RoboLab“",
    city: "Vilnius",
    district: "Naujamiestis",
    address: "Naugarduko g. 34, Vilnius",
    lat: 54.676,
    lng: 25.268,
    category: "IT ir robotika",
    audience: "Vaikams",
    ages: ["10-13 m.", "14-18 m."],
    gender: "Visiems",
    price: 79,
    shortDescription: "Kuriame, konstruojame ir programuojame tikrus robotus.",
    description:
      "„RoboLab“ – tai vieta, kur vaikai ir paaugliai mokosi programavimo per praktiką. Užsiėmimuose konstruojami robotai, programuojami jutikliai ir varikliai, sprendžiami inžineriniai iššūkiai. Pradedantieji mokosi vizualaus programavimo, pažengusieji – Python ir Arduino. Visos priemonės suteikiamos vietoje, o geriausios komandos dalyvauja tarptautinėse robotikos varžybose.",
    schedule: [
      { day: "Trečiadienis", time: "15:30 – 17:00" },
      { day: "Šeštadienis", time: "12:00 – 13:30" },
    ],
    contactName: "Mantas Jonaitis",
    phone: "+370 634 56789",
    email: "labas@robolab.lt",
    image: robotics,
  },
  {
    id: "tapybos-studija-spalvu-sodas",
    title: "Tapybos studija „Spalvų sodas“",
    city: "Vilnius",
    district: "Centras",
    address: "Pylimo g. 21, Vilnius",
    lat: 54.68,
    lng: 25.279,
    category: "Menai",
    audience: "Vaikams",
    ages: ["3-5 m.", "6-9 m."],
    gender: "Visiems",
    price: 45,
    shortDescription: "Kūrybiški tapybos užsiėmimai mažiesiems menininkams.",
    description:
      "„Spalvų sodas“ – šviesi meno studija Vilniaus senamiesčio pakraštyje. Vaikai tapo akvarele, guašu ir akrilu, lipdo iš molio, kuria koliažus. Svarbiausia – ne tobulas rezultatas, o kūrybos džiaugsmas ir pasitikėjimas savimi. Visos priemonės ir prijuostės suteikiamos.",
    schedule: [
      { day: "Antradienis", time: "16:00 – 17:00" },
      { day: "Penktadienis", time: "16:00 – 17:00" },
    ],
    contactName: "Agnė Vaitkutė",
    phone: "+370 645 67890",
    email: "studija@spalvusodas.lt",
    image: painting,
  },
  {
    id: "gitaros-pamokos-akordas",
    title: "Gitaros pamokos suaugusiems „Akordas“",
    city: "Vilnius",
    district: "Šeškinė",
    address: "Šeškinės g. 18, Vilnius",
    lat: 54.713,
    lng: 25.25,
    category: "Muzika",
    audience: "Suaugusiems",
    ages: ["Suaugusiems"],
    gender: "Visiems",
    price: 70,
    shortDescription: "Išmok groti mėgstamas dainas – net jei niekada nelaikei gitaros.",
    description:
      "„Akordas“ – gitaros pamokos suaugusiems, kurie visada norėjo groti, bet vis neturėjo progos. Pirmame užsiėmime išmoksite pirmuosius akordus, o po kelių mėnesių grosite mėgstamas dainas draugų rate. Mažos grupės iki 6 žmonių, draugiška atmosfera ir galimybė pasiskolinti gitarą.",
    schedule: [
      { day: "Pirmadienis", time: "19:00 – 20:30" },
      { day: "Ketvirtadienis", time: "19:00 – 20:30" },
    ],
    contactName: "Darius Mockus",
    phone: "+370 656 78901",
    email: "darius@akordas.lt",
    image: guitar,
  },
  {
    id: "anglu-kalbos-klubas-speak-up",
    title: "Anglų kalbos klubas „Speak Up“",
    city: "Vilnius",
    district: "Pašilaičiai",
    address: "S. Nėries g. 57, Vilnius",
    lat: 54.728,
    lng: 25.233,
    category: "Kalbos",
    audience: "Vaikams",
    ages: ["14-18 m."],
    gender: "Visiems",
    price: 60,
    shortDescription: "Kalbėjimo praktika, pasiruošimas egzaminams ir drąsa kalbėti.",
    description:
      "„Speak Up“ – anglų kalbos klubas paaugliams, kuriame daugiausia dėmesio skiriama kalbėjimui. Diskutuojame aktualiomis temomis, ruošiame pristatymus, žaidžiame kalbinius žaidimus ir ruošiamės valstybiniam brandos egzaminui bei Cambridge egzaminams. Grupės sudaromos pagal kalbos lygį.",
    schedule: [
      { day: "Antradienis", time: "17:30 – 19:00" },
      { day: "Ketvirtadienis", time: "17:30 – 19:00" },
    ],
    contactName: "Eglė Stankevičiūtė",
    phone: "+370 667 89012",
    email: "hello@speakup.lt",
    image: english,
  },
  {
    id: "siuolaikiniu-sokiu-studija-ritmas",
    perks: ["trial"],
    title: "Šiuolaikinių šokių studija „Ritmas“",
    city: "Vilnius",
    district: "Fabijoniškės",
    address: "Fabijoniškių g. 7, Vilnius",
    lat: 54.733,
    lng: 25.248,
    category: "Šokiai",
    audience: "Suaugusiems",
    ages: ["Suaugusiems"],
    gender: "Visiems",
    price: 50,
    shortDescription: "Energingi šiuolaikinio šokio užsiėmimai po darbo.",
    description:
      "„Ritmas“ kviečia suaugusiuosius atrasti judesio laisvę. Užsiėmimai prasideda apšilimu ir tempimu, toliau mokomės šiuolaikinio šokio technikos ir trumpų kombinacijų. Tinka ir pradedantiesiems – svarbiausia noras judėti ir gera nuotaika. Pirmasis užsiėmimas nemokamas.",
    schedule: [
      { day: "Trečiadienis", time: "19:00 – 20:15" },
      { day: "Sekmadienis", time: "11:00 – 12:15" },
    ],
    contactName: "Indrė Balčiūnaitė",
    phone: "+370 678 90123",
    email: "ritmas.studija@gmail.com",
    image: contemporary,
  },
  {
    id: "futbolo-mokykla-pilaites-zaibas",
    perks: ["nvs"],
    title: "Futbolo mokykla „Pilaitės Žaibas“",
    city: "Vilnius",
    district: "Pilaitė",
    address: "Pilaitės pr. 14, Vilnius",
    lat: 54.708,
    lng: 25.183,
    category: "Sportas",
    audience: "Vaikams",
    ages: ["6-9 m.", "10-13 m."],
    gender: "Berniukams",
    price: 40,
    shortDescription: "Futbolo treniruotės lauke ir salėje visus metus.",
    description:
      "„Pilaitės Žaibas“ – draugiška futbolo mokykla, kurioje vaikai mokosi futbolo pagrindų, komandinio darbo ir sąžiningo žaidimo. Šiltuoju sezonu treniruojamės dirbtinės dangos aikštelėje, žiemą – mokyklos sporto salėje. Komandos dalyvauja Vilniaus vaikų futbolo turnyruose.",
    schedule: [
      { day: "Pirmadienis", time: "17:00 – 18:15" },
      { day: "Trečiadienis", time: "17:00 – 18:15" },
      { day: "Penktadienis", time: "17:00 – 18:15" },
    ],
    contactName: "Andrius Žukauskas",
    phone: "+370 689 01234",
    email: "pilaiteszaibas@gmail.com",
    image: football,
  },
];
