export interface Airport {
  code: string;
  city: string;
  cityEn: string;
  country: string;
  flag: string;
  name: string;
}

export const AIRPORTS: Airport[] = [
  // RDC
  { code: "FIH", city: "Kinshasa",     cityEn: "Kinshasa",      country: "CD", flag: "🇨🇩", name: "N'Djili International" },
  { code: "FBM", city: "Lubumbashi",   cityEn: "Lubumbashi",    country: "CD", flag: "🇨🇩", name: "Lubumbashi International" },
  { code: "GOM", city: "Goma",         cityEn: "Goma",          country: "CD", flag: "🇨🇩", name: "Goma International" },
  { code: "BKY", city: "Bukavu",       cityEn: "Bukavu",        country: "CD", flag: "🇨🇩", name: "Kavumu" },
  { code: "FKI", city: "Kisangani",    cityEn: "Kisangani",     country: "CD", flag: "🇨🇩", name: "Bangoka International" },
  { code: "MJM", city: "Mbuji-Mayi",  cityEn: "Mbuji-Mayi",   country: "CD", flag: "🇨🇩", name: "Mbuji-Mayi" },
  // Afrique centrale & est
  { code: "BZV", city: "Brazzaville", cityEn: "Brazzaville",   country: "CG", flag: "🇨🇬", name: "Maya-Maya International" },
  { code: "DLA", city: "Douala",       cityEn: "Douala",        country: "CM", flag: "🇨🇲", name: "Douala International" },
  { code: "LBV", city: "Libreville",  cityEn: "Libreville",    country: "GA", flag: "🇬🇦", name: "Léon-Mba International" },
  { code: "EBB", city: "Kampala",      cityEn: "Kampala",       country: "UG", flag: "🇺🇬", name: "Entebbe International" },
  { code: "DAR", city: "Dar es Salaam", cityEn: "Dar es Salaam", country: "TZ", flag: "🇹🇿", name: "Julius Nyerere International" },
  { code: "NBO", city: "Nairobi",      cityEn: "Nairobi",       country: "KE", flag: "🇰🇪", name: "Jomo Kenyatta International" },
  { code: "MBA", city: "Mombasa",      cityEn: "Mombasa",       country: "KE", flag: "🇰🇪", name: "Moi International" },
  { code: "ADD", city: "Addis-Abeba",  cityEn: "Addis Ababa",   country: "ET", flag: "🇪🇹", name: "Bole International" },
  { code: "TNR", city: "Antananarivo", cityEn: "Antananarivo",  country: "MG", flag: "🇲🇬", name: "Ivato International" },
  // Afrique australe & ouest
  { code: "JNB", city: "Johannesburg", cityEn: "Johannesburg",  country: "ZA", flag: "🇿🇦", name: "O.R. Tambo International" },
  { code: "CPT", city: "Le Cap",        cityEn: "Cape Town",     country: "ZA", flag: "🇿🇦", name: "Cape Town International" },
  { code: "LUN", city: "Lusaka",        cityEn: "Lusaka",        country: "ZM", flag: "🇿🇲", name: "Kenneth Kaunda International" },
  { code: "HRE", city: "Harare",        cityEn: "Harare",        country: "ZW", flag: "🇿🇼", name: "Robert Mugabe International" },
  { code: "LOS", city: "Lagos",         cityEn: "Lagos",         country: "NG", flag: "🇳🇬", name: "Murtala Muhammed International" },
  { code: "ABV", city: "Abuja",         cityEn: "Abuja",         country: "NG", flag: "🇳🇬", name: "Nnamdi Azikiwe International" },
  { code: "ACC", city: "Accra",         cityEn: "Accra",         country: "GH", flag: "🇬🇭", name: "Kotoka International" },
  { code: "DKR", city: "Dakar",         cityEn: "Dakar",         country: "SN", flag: "🇸🇳", name: "Blaise Diagne International" },
  { code: "CMN", city: "Casablanca",    cityEn: "Casablanca",    country: "MA", flag: "🇲🇦", name: "Mohammed V International" },
  { code: "CAI", city: "Le Caire",      cityEn: "Cairo",         country: "EG", flag: "🇪🇬", name: "Cairo International" },
  // Europe
  { code: "CDG", city: "Paris",         cityEn: "Paris",         country: "FR", flag: "🇫🇷", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris",         cityEn: "Paris",         country: "FR", flag: "🇫🇷", name: "Paris-Orly" },
  { code: "BRU", city: "Bruxelles",     cityEn: "Brussels",      country: "BE", flag: "🇧🇪", name: "Bruxelles-Zaventem" },
  { code: "LHR", city: "Londres",       cityEn: "London",        country: "GB", flag: "🇬🇧", name: "Heathrow" },
  { code: "LGW", city: "Londres",       cityEn: "London",        country: "GB", flag: "🇬🇧", name: "Gatwick" },
  { code: "AMS", city: "Amsterdam",     cityEn: "Amsterdam",     country: "NL", flag: "🇳🇱", name: "Schiphol" },
  { code: "FRA", city: "Francfort",     cityEn: "Frankfurt",     country: "DE", flag: "🇩🇪", name: "Frankfurt International" },
  { code: "IST", city: "Istanbul",      cityEn: "Istanbul",      country: "TR", flag: "🇹🇷", name: "Istanbul Airport" },
  { code: "MAD", city: "Madrid",        cityEn: "Madrid",        country: "ES", flag: "🇪🇸", name: "Adolfo Suárez Barajas" },
  { code: "FCO", city: "Rome",          cityEn: "Rome",          country: "IT", flag: "🇮🇹", name: "Leonardo da Vinci" },
  // Moyen-Orient
  { code: "DXB", city: "Dubaï",         cityEn: "Dubai",         country: "AE", flag: "🇦🇪", name: "Dubai International" },
  { code: "DOH", city: "Doha",          cityEn: "Doha",          country: "QA", flag: "🇶🇦", name: "Hamad International" },
  { code: "AUH", city: "Abou Dhabi",    cityEn: "Abu Dhabi",     country: "AE", flag: "🇦🇪", name: "Zayed International" },
  // Amériques
  { code: "JFK", city: "New York",      cityEn: "New York",      country: "US", flag: "🇺🇸", name: "John F. Kennedy International" },
  { code: "YUL", city: "Montréal",      cityEn: "Montreal",      country: "CA", flag: "🇨🇦", name: "Pierre Elliott Trudeau" },
  { code: "GRU", city: "São Paulo",     cityEn: "Sao Paulo",     country: "BR", flag: "🇧🇷", name: "Guarulhos International" },
];

export function searchAirports(query: string, lang: "fr" | "en" = "fr"): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return AIRPORTS.slice(0, 8);
  return AIRPORTS.filter((a) => {
    const city = lang === "en" ? a.cityEn : a.city;
    return (
      a.code.toLowerCase().includes(q) ||
      city.toLowerCase().includes(q) ||
      a.cityEn.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  }).slice(0, 8);
}

export function airportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}
