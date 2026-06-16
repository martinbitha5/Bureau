export interface Airline {
  slug: string;
  name: string;
  iata: string;
  color: string;
  heroFrom: string;
  heroTo: string;
}

export const AIRLINES: Airline[] = [
  // Afrique / RDC focus
  { slug: "ethiopian-airlines",    name: "Ethiopian Airlines",   iata: "ET", color: "#006241", heroFrom: "#006241", heroTo: "#003520" },
  { slug: "kenya-airways",         name: "Kenya Airways",        iata: "KQ", color: "#CC0000", heroFrom: "#7B0000", heroTo: "#2D0000" },
  { slug: "rwandair",              name: "RwandAir",             iata: "WB", color: "#0055A4", heroFrom: "#003580", heroTo: "#001540" },
  { slug: "brussels-airlines",     name: "Brussels Airlines",    iata: "SN", color: "#0033A0", heroFrom: "#0033A0", heroTo: "#001040" },
  { slug: "south-african-airways", name: "South African Airways",iata: "SA", color: "#003580", heroFrom: "#003580", heroTo: "#001030" },
  { slug: "egyptair",              name: "EgyptAir",             iata: "MS", color: "#003B79", heroFrom: "#003B79", heroTo: "#001030" },
  { slug: "air-algerie",           name: "Air Algérie",          iata: "AH", color: "#005E6A", heroFrom: "#005E6A", heroTo: "#002830" },
  // Europe
  { slug: "air-france",            name: "Air France",           iata: "AF", color: "#002157", heroFrom: "#002157", heroTo: "#000A20" },
  { slug: "lufthansa",             name: "Lufthansa",            iata: "LH", color: "#05164D", heroFrom: "#05164D", heroTo: "#010820" },
  { slug: "klm",                   name: "KLM",                  iata: "KL", color: "#009FE3", heroFrom: "#006FA8", heroTo: "#003055" },
  { slug: "british-airways",       name: "British Airways",      iata: "BA", color: "#2B5EAB", heroFrom: "#1A3A80", heroTo: "#081540" },
  { slug: "swiss",                 name: "SWISS",                iata: "LX", color: "#C8102E", heroFrom: "#8B000A", heroTo: "#3D0005" },
  { slug: "iberia",                name: "Iberia",               iata: "IB", color: "#C32032", heroFrom: "#800010", heroTo: "#350005" },
  // Moyen-Orient
  { slug: "qatar-airways",         name: "Qatar Airways",        iata: "QR", color: "#5C1B3B", heroFrom: "#5C1B3B", heroTo: "#1A0010" },
  { slug: "emirates",              name: "Emirates",             iata: "EK", color: "#D71920", heroFrom: "#8B0000", heroTo: "#300000" },
  { slug: "etihad",                name: "Etihad Airways",       iata: "EY", color: "#A07800", heroFrom: "#6B5000", heroTo: "#2D2000" },
  { slug: "turkish-airlines",      name: "Turkish Airlines",     iata: "TK", color: "#C70000", heroFrom: "#7A0000", heroTo: "#300000" },
  // Amérique
  { slug: "air-canada",            name: "Air Canada",           iata: "AC", color: "#C40A0A", heroFrom: "#7A0000", heroTo: "#300000" },
  { slug: "united",                name: "United Airlines",      iata: "UA", color: "#1E4298", heroFrom: "#0A1F60", heroTo: "#030A20" },
  { slug: "american-airlines",     name: "American Airlines",    iata: "AA", color: "#0073CF", heroFrom: "#003E7A", heroTo: "#001830" },
  // Asie / Océanie
  { slug: "singapore-airlines",    name: "Singapore Airlines",   iata: "SQ", color: "#F5820D", heroFrom: "#8B4500", heroTo: "#3D1A00" },
  { slug: "cathay-pacific",        name: "Cathay Pacific",       iata: "CX", color: "#006666", heroFrom: "#004040", heroTo: "#001A1A" },
];

export const AIRLINES_ROW1 = AIRLINES.slice(0, 11);
export const AIRLINES_ROW2 = AIRLINES.slice(11, 22);

export function airlineBySlug(slug: string): Airline | undefined {
  return AIRLINES.find((a) => a.slug === slug);
}
