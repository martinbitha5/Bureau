export interface CabinClass {
  name: string;
  features: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface AirlineContent {
  slug: string;
  descriptionFr: string;
  whyBookFr: string[];
  destinationsFr: {
    coverage: string;
    regions: { region: string; cities: string[] }[];
    popularRoutes: string[];
  };
  pricingFr: {
    economy: string;
    business: string;
    bestTime: string;
    lowSeason: string;
    tips: string[];
  };
  howToBookFr: string[];
  cabinClassesFr: CabinClass[];
  baggageFr: {
    carryon: string[];
    checked: string[];
  };
  faqFr: FaqItem[];
  latestNewsFr?: string[];
  similarSlugs: string[];
}

export const AIRLINE_CONTENT: Record<string, AirlineContent> = {
  "qatar-airways": {
    slug: "qatar-airways",
    descriptionFr:
      "Qatar Airways est la compagnie aérienne la plus récompensée au monde, ayant remporté neuf fois le titre de meilleure compagnie aérienne au monde décerné par Skytrax, y compris en 2025. Volant vers plus de 170 destinations dans 86 pays depuis son hub à l'aéroport international Hamad de Doha, elle est connue pour son service haut de gamme, ses avions modernes et son confort exceptionnel à bord. Que tu voyages pour les affaires ou les loisirs, Qatar Airways relie les villes clés du monde entier avec des horaires fréquents, des cabines primées et le type de service qui fait revenir les passagers.",
    whyBookFr: [
      "Meilleure compagnie aérienne au monde à neuf reprises — 5 étoiles Skytrax",
      "Flotte moderne incluant la classe affaires QSuite avec suites entièrement fermées",
      "Hub à l'aéroport international Hamad — classé meilleur aéroport du monde",
      "Plus de 170 destinations, reliant l'Europe, l'Asie, l'Afrique, les Amériques et l'Océanie",
      "Wi-Fi haut débit Starlink gratuit en cours de déploiement sur toute la flotte",
      "Un service primé dans toutes les catégories de cabines",
    ],
    destinationsFr: {
      coverage:
        "Qatar Airways relie les passagers à plus de 170 destinations à travers 86 pays. Son hub stratégique à Doha se trouve à moins de huit heures des deux tiers de la population mondiale, idéal pour des correspondances rapides.",
      regions: [
        { region: "Europe", cities: ["Londres", "Paris", "Rome", "Francfort", "Madrid", "Amsterdam", "Bruxelles"] },
        { region: "Afrique", cities: ["Nairobi", "Le Cap", "Johannesburg", "Casablanca", "Lagos", "Kinshasa"] },
        { region: "Asie", cities: ["Bangkok", "Tokyo", "Singapour", "Mumbai", "Manille", "Kuala Lumpur"] },
        { region: "Amériques", cities: ["New York", "Chicago", "Miami", "São Paulo", "Buenos Aires"] },
        { region: "Océanie", cities: ["Sydney", "Melbourne", "Auckland"] },
      ],
      popularRoutes: [
        "Kinshasa (FIH) → Doha (DOH) via Nairobi",
        "Doha (DOH) → Londres (LHR)",
        "Doha (DOH) → New York (JFK)",
        "Doha (DOH) → Sydney (SYD)",
      ],
    },
    pricingFr: {
      economy: "Les tarifs Économie long-courriers comme Kinshasa-Doha-Londres débutent autour de 700 – 1 200 USD aller-retour selon la saison.",
      business: "La classe Affaires (QSuite) sur les itinéraires clés commence souvent à partir de 3 000 – 5 000 USD aller-retour.",
      bestTime: "Réserve 3 à 6 mois à l'avance pour les voyages long-courriers afin d'obtenir les meilleurs tarifs.",
      lowSeason: "La basse saison (mai-juin et septembre-début décembre) offre souvent de meilleurs tarifs. Les départs en milieu de semaine (mardi-jeudi) sont généralement moins chers.",
      tips: [
        "Utilise l'outil de recherche de Sensei Flights pour comparer les dates.",
        "Profite du paiement Sensei Pay pour étaler le coût dans le temps sans intérêts.",
        "Réserve les bagages supplémentaires en avance — moins cher qu'à l'aéroport.",
      ],
    },
    howToBookFr: [
      "Recherche des vols en indiquant ton départ, ta destination et tes dates.",
      "Compare les résultats et sélectionne le vol Qatar Airways qui te convient.",
      "Choisis ta cabine, l'horaire et le type de tarif.",
      "Ajoute des extras comme des sièges attribués ou des bagages supplémentaires.",
      "Choisis ton mode de paiement (comptant ou Sensei Pay en 3×/6×) et confirme.",
    ],
    cabinClassesFr: [
      {
        name: "Classe Économique",
        features: [
          "Sièges confortables avec espace généreux pour les jambes et appuis-tête réglables.",
          "Écrans de divertissement personnels avec le système Oryx One (8 000+ options).",
          "Repas, collations et boissons gratuits sur tous les vols long-courriers.",
          "Franchise de bagages de 20 kg à 35 kg selon le tarif et l'itinéraire.",
        ],
      },
      {
        name: "Classe Affaires — QSuite",
        features: [
          "Suites entièrement fermées avec portes coulissantes pour plus d'intimité.",
          "Lits à plat et possibilité de créer des lits doubles ou sièges partagés.",
          "Service de restauration à la demande avec menus à la carte.",
          "Accès aux salons premium Al Mourjan à Doha.",
          "Enregistrement, embarquement et traitement des bagages prioritaires.",
        ],
      },
      {
        name: "Première Classe",
        features: [
          "Disponible sur l'Airbus A380 — huit suites privées avec lits de 83 pouces.",
          "Prestations haut de gamme, y compris service de caviar sur certains itinéraires.",
          "Accès au salon Al Safwa First à l'aéroport international de Hamad.",
          "Franchise de bagages ultra-généreuse et service personnalisé.",
        ],
      },
    ],
    baggageFr: {
      carryon: [
        "Économie : 1 pièce jusqu'à 7 kg",
        "Affaires & Première : 2 pièces, poids combiné jusqu'à 15 kg",
      ],
      checked: [
        "Économie : 20–35 kg selon le tarif",
        "Classe Affaires : jusqu'à 40 kg",
        "Première Classe : jusqu'à 50 kg",
        "Vols vers les Amériques : 2 pièces × 23 kg (Éco) ou 2 × 32 kg (Affaires/Première)",
      ],
    },
    faqFr: [
      { q: "Comment réserver un vol Qatar Airways via Sensei Flights ?", a: "Utilise le formulaire de recherche ci-dessus : indique ton départ, ta destination et tes dates. Compare les options et sélectionne ton vol. Tu peux payer en une fois ou en plusieurs versements sans intérêts avec Sensei Pay." },
      { q: "Quelles classes de cabine propose Qatar Airways ?", a: "Qatar Airways propose trois classes : Économie (confort standard, divertissement Oryx One), Affaires QSuite (suites fermées, lits à plat, à la carte) et Première Classe (disponible sur A380, suites ultra-privées)." },
      { q: "Quelle est la franchise de bagages de Qatar Airways ?", a: "En Économie : 1 bagage cabine (7 kg) + 20–35 kg en soute. En Affaires : 2 cabines (15 kg) + 40 kg soute. En Première : jusqu'à 50 kg. Vers les Amériques, le système est basé sur le nombre de pièces." },
      { q: "Qatar Airways propose-t-elle le WiFi à bord ?", a: "Oui — Qatar Airways déploie progressivement le Wi-Fi Starlink haut débit gratuit sur sa flotte. Disponible sur les Boeing 777 depuis début 2025, avec extension aux A350 en cours." },
      { q: "Puis-je payer mon vol Qatar Airways en plusieurs fois ?", a: "Oui ! Via Sensei Pay, tu peux étaler le coût de ton billet en 3 ou 6 versements sans intérêts. Ton billet est confirmé immédiatement après la première tranche." },
      { q: "Quel aéroport Qatar Airways utilise-t-il comme hub ?", a: "L'aéroport international Hamad (DOH) à Doha, Qatar — classé meilleur aéroport du monde. Il se trouve à moins de 8 heures de vol des deux tiers de la population mondiale." },
      { q: "Qatar Airways fait-elle partie d'une alliance aérienne ?", a: "Oui, Qatar Airways est membre de l'alliance Oneworld, la seule compagnie du Golfe dans cette alliance. Tu peux gagner et utiliser des miles sur plus de 15 compagnies partenaires." },
      { q: "À quelle heure arriver à l'aéroport pour Qatar Airways ?", a: "Arrive au moins 3 heures avant le départ pour les vols internationaux, 2 heures pour les vols régionaux. L'aéroport Hamad est bien organisé mais les files de sécurité peuvent être longues aux heures de pointe." },
    ],
    latestNewsFr: [
      "🏆 Qatar Airways a remporté le prix de la meilleure compagnie aérienne au monde Skytrax pour la 9ème fois en 2025.",
      "✈️ Commande historique de 130 Boeing 787 Dreamliners et 30 Boeing 777-9 en mai 2025.",
      "🗺️ Nouvelles destinations en 2025 : Bogota, Caracas et Malte.",
      "📡 Déploiement du Wi-Fi Starlink gratuit sur les Boeing 777, extension aux A350 à mi-2025.",
    ],
    similarSlugs: ["emirates", "etihad", "singapore-airlines", "turkish-airlines", "lufthansa", "british-airways"],
  },

  "emirates": {
    slug: "emirates",
    descriptionFr:
      "Emirates est l'une des plus grandes compagnies aériennes au monde, opérant depuis son hub à Dubaï (DXB). Reconnue pour son service premium, ses A380 iconiques et son réseau couvrant plus de 150 destinations dans 80+ pays, Emirates offre une expérience de voyage inégalée.",
    whyBookFr: [
      "L'une des compagnies aériennes les plus primées au monde",
      "Flotte de pointe incluant les A380 et Boeing 777",
      "Hub à Dubaï — l'un des aéroports les plus connectés au monde",
      "Plus de 150 destinations sur 6 continents",
      "Wi-Fi ICE (Information, Communication, Entertainment) à bord",
      "Programme Skywards avec miles généreux",
    ],
    destinationsFr: {
      coverage: "Emirates relie plus de 150 destinations dans plus de 80 pays depuis son hub de Dubaï.",
      regions: [
        { region: "Europe", cities: ["Paris", "Londres", "Amsterdam", "Francfort", "Madrid"] },
        { region: "Afrique", cities: ["Nairobi", "Johannesburg", "Lagos", "Dar es Salaam", "Kinshasa"] },
        { region: "Asie", cities: ["Bangkok", "Mumbai", "Singapour", "Tokyo", "Hong Kong"] },
        { region: "Amériques", cities: ["New York", "Los Angeles", "Chicago", "Houston", "São Paulo"] },
        { region: "Océanie", cities: ["Sydney", "Melbourne", "Auckland", "Brisbane"] },
      ],
      popularRoutes: [
        "Kinshasa (FIH) → Dubaï (DXB)",
        "Dubaï (DXB) → Londres (LHR)",
        "Dubaï (DXB) → Sydney (SYD)",
        "Dubaï (DXB) → New York (JFK)",
      ],
    },
    pricingFr: {
      economy: "Les tarifs Économie débutent autour de 600–1 100 USD selon l'itinéraire et la saison.",
      business: "La classe Affaires commence à partir de 2 500–4 500 USD aller-retour sur les itinéraires long-courriers.",
      bestTime: "Réserve 2 à 4 mois à l'avance pour les meilleures offres sur les itinéraires populaires.",
      lowSeason: "Les périodes creuses (mai-juin, septembre-novembre) offrent de meilleurs tarifs. Les vols de milieu de semaine sont souvent moins chers.",
      tips: [
        "Utilise le comparateur de dates de Sensei Flights pour trouver le meilleur tarif.",
        "Paye en 3 ou 6 fois sans intérêts avec Sensei Pay.",
        "Réserve tôt pour les destinations populaires pendant les vacances.",
      ],
    },
    howToBookFr: [
      "Lance une recherche avec ton aéroport de départ, ta destination et tes dates.",
      "Compare les options Emirates disponibles.",
      "Sélectionne ta classe de cabine préférée.",
      "Ajoute les extras souhaités (bagages, sièges, repas).",
      "Finalise avec le mode de paiement de ton choix.",
    ],
    cabinClassesFr: [
      {
        name: "Classe Économique",
        features: [
          "Sièges ergonomiques avec système IFE ICE (plus de 5 000 canaux).",
          "Repas et boissons gratuits sur tous les vols.",
          "Franchise de bagages de 25–35 kg selon l'itinéraire.",
          "Wi-Fi disponible (payant sur la plupart des vols).",
        ],
      },
      {
        name: "Classe Affaires",
        features: [
          "Fauteuils plats avec espace privé et accès à l'allée.",
          "Service de restauration à la carte avec vins et spiritueux premium.",
          "Accès aux salons Emirates Business dans les aéroports.",
          "Franchise de bagages de 40 kg.",
        ],
      },
      {
        name: "Première Classe (A380)",
        features: [
          "Suites privées fermées avec lits doubles sur A380.",
          "Douches à bord disponibles en Première sur A380.",
          "Bar en vol et salon privatif.",
          "Franchise bagages de 50 kg et service de chauffeur.",
        ],
      },
    ],
    baggageFr: {
      carryon: ["Économie : 1 pièce × 7 kg", "Affaires & Première : 2 pièces × 7 kg chacune"],
      checked: [
        "Économie : 25–35 kg selon l'itinéraire",
        "Affaires : 40 kg",
        "Première : 50 kg",
      ],
    },
    faqFr: [
      { q: "Emirates vole-t-elle depuis Kinshasa ?", a: "Emirates propose des vols vers Kinshasa (FIH) avec connexion à Dubaï (DXB). Plusieurs options de correspondances sont disponibles selon ta destination finale." },
      { q: "Puis-je payer mon vol Emirates en plusieurs fois ?", a: "Oui, via Sensei Pay, tu peux étaler le coût en 3 ou 6 versements sans intérêts. Ton billet est confirmé immédiatement." },
      { q: "Quelle est la franchise bagages Emirates ?", a: "Économie : 25–35 kg en soute. Affaires : 40 kg. Première : 50 kg. Vers les Amériques, le système basé sur les pièces s'applique." },
      { q: "Emirates propose-t-elle des douches à bord ?", a: "Oui — des douches sont disponibles en Première Classe sur les A380. Un service unique dans l'industrie aérienne." },
    ],
    similarSlugs: ["qatar-airways", "etihad", "singapore-airlines", "turkish-airlines"],
  },

  "air-france": {
    slug: "air-france",
    descriptionFr:
      "Air France est la compagnie nationale française, opérant depuis son hub à Paris-Charles de Gaulle (CDG). Avec un réseau couvrant plus de 200 destinations dans 90 pays, Air France est reconnue pour son service raffiné, sa gastronomie française à bord et sa classe Business La Suite.",
    whyBookFr: [
      "Membre de l'alliance SkyTeam — partenaires dans le monde entier",
      "Gastronomie française authentique en classe Affaires et Première",
      "Hub à Paris-CDG — l'un des plus grands aéroports d'Europe",
      "Programme Flying Blue avec miles utilisables sur Air France et KLM",
      "Nouvelle classe Affaires La Suite sur les long-courriers",
      "Vols directs Paris → Kinshasa avec temps de vol optimisé",
    ],
    destinationsFr: {
      coverage: "Air France relie plus de 200 destinations dans 90 pays depuis Paris-Charles de Gaulle et Paris-Orly.",
      regions: [
        { region: "Europe", cities: ["Paris", "Nice", "Lyon", "Bordeaux", "Amsterdam"] },
        { region: "Afrique", cities: ["Kinshasa", "Abidjan", "Dakar", "Nairobi", "Johannesburg", "Libreville"] },
        { region: "Amériques", cities: ["New York", "Los Angeles", "Montréal", "São Paulo", "Buenos Aires"] },
        { region: "Asie", cities: ["Tokyo", "Shanghai", "Mumbai", "Singapour", "Bangkok"] },
        { region: "Océanie", cities: ["Sydney", "Melbourne"] },
      ],
      popularRoutes: [
        "Kinshasa (FIH) → Paris (CDG) direct",
        "Paris (CDG) → New York (JFK)",
        "Paris (CDG) → Tokyo (NRT)",
        "Paris (CDG) → Abidjan (ABJ)",
      ],
    },
    pricingFr: {
      economy: "Les tarifs Économie Paris-Kinshasa débutent à environ 600–900 EUR aller-retour selon la saison.",
      business: "La classe Affaires Paris-Kinshasa commence à partir de 2 000–3 500 EUR aller-retour.",
      bestTime: "Réserve 2 à 4 mois à l'avance. Les vols de milieu de semaine sont généralement moins chers.",
      lowSeason: "Les périodes mai-juin et septembre-novembre offrent les meilleurs tarifs hors saisons estivale et hivernale.",
      tips: [
        "Utilise le programme Flying Blue pour accumuler des miles.",
        "Paye en 3 ou 6 fois sans intérêts avec Sensei Pay.",
        "Les tarifs Light n'incluent pas de bagage en soute — vérifie avant de réserver.",
      ],
    },
    howToBookFr: [
      "Recherche ton vol avec départ, destination et dates souhaitées.",
      "Filtre les résultats pour voir les vols Air France directs ou avec escale.",
      "Sélectionne ta classe de cabine (Light, Standard, Flex en Économie).",
      "Ajoute des bagages ou un siège si besoin.",
      "Choisis ton mode de paiement et confirme.",
    ],
    cabinClassesFr: [
      { name: "Classe Économique", features: ["Sièges confortables avec repas inclus sur long-courriers.", "Système de divertissement personnel.", "Franchise de bagages selon le tarif choisi (Light/Standard/Flex)."] },
      { name: "Classe Affaires (La Suite)", features: ["Fauteuils plats avec accès direct à l'allée.", "Gastronomie française à bord avec chefs partenaires.", "Accès au salon Business Lounge à CDG.", "Franchise de bagages de 3 pièces × 23 kg."] },
      { name: "Première Classe", features: ["Suite privée avec séparation totale.", "Gastronomie de chef à bord.", "Chauffeur et accès salon La Première à CDG.", "Franchise bagages de 3 pièces × 32 kg."] },
    ],
    baggageFr: {
      carryon: ["Économie : 1 pièce × 12 kg max", "Affaires & Première : 2 pièces × 18 kg combiné"],
      checked: ["Économie Light : 0 kg (aucun bagage inclus)", "Économie Standard : 23 kg", "Affaires : 2 × 23 kg", "Première : 3 × 32 kg"],
    },
    faqFr: [
      { q: "Air France vole-t-elle directement sur Kinshasa ?", a: "Oui, Air France opère des vols directs Paris-CDG → Kinshasa (FIH). C'est l'une des rares liaisons directes Europe-RDC disponibles." },
      { q: "Puis-je payer mon vol Air France en plusieurs fois ?", a: "Via Sensei Pay, tu peux étaler le coût en 3 ou 6 versements sans intérêts, avec confirmation immédiate de ton billet." },
      { q: "Qu'est-ce que la classe Affaires La Suite Air France ?", a: "La Suite est la nouvelle classe Affaires d'Air France avec des fauteuils plats à accès direct à l'allée, la gastronomie française à bord et l'accès au salon Business Lounge." },
    ],
    similarSlugs: ["klm", "lufthansa", "swiss", "british-airways", "iberia"],
  },

  "ethiopian-airlines": {
    slug: "ethiopian-airlines",
    descriptionFr:
      "Ethiopian Airlines est la plus grande compagnie aérienne d'Afrique et l'une des plus rentables du continent. Opérant depuis Addis-Abeba (ADD), elle dessert plus de 130 destinations dans 80 pays et est le principal transporteur reliant l'Afrique au reste du monde.",
    whyBookFr: [
      "La plus grande compagnie aérienne d'Afrique avec plus de 130 destinations",
      "Hub stratégique à Addis-Abeba — porte d'entrée de l'Afrique",
      "Flotte moderne incluant Boeing 787 Dreamliner et A350",
      "Programme ShebaMiles pour les voyageurs fréquents",
      "Connexions fréquentes depuis Kinshasa vers l'Afrique et le monde",
      "Membre de l'alliance Star Alliance",
    ],
    destinationsFr: {
      coverage: "Ethiopian Airlines dessert plus de 130 destinations dans 80 pays, principalement en Afrique, au Moyen-Orient, en Europe, en Asie et aux Amériques.",
      regions: [
        { region: "Afrique", cities: ["Kinshasa", "Nairobi", "Lagos", "Johannesburg", "Accra", "Dakar", "Luanda"] },
        { region: "Europe", cities: ["Londres", "Paris", "Francfort", "Rome", "Bruxelles"] },
        { region: "Asie", cities: ["Mumbai", "Dubaï", "Bangkok", "Guangzhou", "Tokyo"] },
        { region: "Amériques", cities: ["Washington DC", "New York", "Toronto", "São Paulo"] },
        { region: "Moyen-Orient", cities: ["Dubaï", "Riyad", "Beyrouth"] },
      ],
      popularRoutes: [
        "Kinshasa (FIH) → Addis-Abeba (ADD)",
        "Addis-Abeba (ADD) → Nairobi (NBO)",
        "Addis-Abeba (ADD) → Londres (LHR)",
        "Addis-Abeba (ADD) → Washington (IAD)",
      ],
    },
    pricingFr: {
      economy: "Les tarifs Économie depuis Kinshasa vers l'Europe via ADD débutent autour de 700–1 100 USD aller-retour.",
      business: "La classe Cloud Nine (Affaires) commence à partir de 2 000–4 000 USD selon l'itinéraire.",
      bestTime: "Réserve 2 à 3 mois à l'avance. Les tarifs sont compétitifs pour les connexions intra-africaines.",
      lowSeason: "Hors saisons de pointe (décembre-janvier et juillet-août), les tarifs sont plus accessibles.",
      tips: [
        "Les connexions via Addis-Abeba sont souvent plus économiques que les vols directs.",
        "Paye en 3 ou 6 fois avec Sensei Pay.",
        "Vérifie les temps de correspondance minimum à ADD.",
      ],
    },
    howToBookFr: [
      "Recherche avec ton départ (ex: FIH), ta destination et tes dates.",
      "Compare les options Ethiopian Airlines avec ou sans escale à ADD.",
      "Sélectionne ta classe de cabine.",
      "Ajoute les bagages supplémentaires si nécessaire.",
      "Confirme avec Sensei Pay ou paiement comptant.",
    ],
    cabinClassesFr: [
      { name: "Classe Économique", features: ["Sièges confortables avec divertissement en vol.", "Repas inclus sur vols long-courriers.", "Franchise de 23 kg en soute.", "Wi-Fi disponible sur certains appareils."] },
      { name: "Classe Affaires — Cloud Nine", features: ["Fauteuils plats sur Boeing 787 et A350.", "Service de restauration premium.", "Accès aux salons Cloud Nine à ADD.", "Franchise de 32 kg en soute."] },
    ],
    baggageFr: {
      carryon: ["Économie : 1 pièce × 7 kg", "Affaires : 2 pièces × 7 kg chacune"],
      checked: ["Économie : 23 kg", "Affaires : 32 kg", "Sur certains itinéraires : basé sur les pièces"],
    },
    faqFr: [
      { q: "Ethiopian Airlines vole-t-elle depuis Kinshasa ?", a: "Oui, Ethiopian Airlines opère des vols réguliers depuis Kinshasa (FIH) vers Addis-Abeba (ADD) avec correspondances vers l'Afrique, l'Europe et l'Asie." },
      { q: "Qu'est-ce que la classe Cloud Nine ?", a: "Cloud Nine est la classe Affaires d'Ethiopian Airlines, avec des fauteuils plats, un service premium et l'accès aux salons Cloud Nine à Addis-Abeba." },
      { q: "Puis-je payer en plusieurs fois ?", a: "Oui, Sensei Pay te permet de payer en 3 ou 6 fois sans intérêts avec confirmation immédiate." },
    ],
    similarSlugs: ["kenya-airways", "rwandair", "south-african-airways", "egyptair"],
  },
};

export function getAirlineContent(slug: string): AirlineContent | undefined {
  if (AIRLINE_CONTENT[slug]) return AIRLINE_CONTENT[slug];

  // Generic fallback for airlines without specific content
  return {
    slug,
    descriptionFr: `Réservez vos billets d'avion en toute simplicité via Sensei Flights et payez en plusieurs fois sans intérêts avec Sensei Pay. Notre équipe basée à Kinshasa vous accompagne à chaque étape de votre voyage.`,
    whyBookFr: [
      "Réseau mondial couvrant des centaines de destinations",
      "Réservation simple et rapide en quelques clics",
      "Paiement flexible en 3 ou 6 fois sans intérêts avec Sensei Pay",
      "Confirmation immédiate de votre billet",
      "Support client disponible 7j/7 depuis Kinshasa",
    ],
    destinationsFr: {
      coverage: "Cette compagnie dessert de nombreuses destinations à travers le monde avec des connexions pratiques.",
      regions: [
        { region: "Afrique", cities: ["Kinshasa", "Nairobi", "Lagos", "Johannesburg", "Dakar"] },
        { region: "Europe", cities: ["Paris", "Londres", "Bruxelles", "Amsterdam", "Francfort"] },
        { region: "Moyen-Orient", cities: ["Dubaï", "Doha", "Istanbul"] },
        { region: "Asie", cities: ["Mumbai", "Bangkok", "Singapour"] },
        { region: "Amériques", cities: ["New York", "Montreal", "São Paulo"] },
      ],
      popularRoutes: [
        "Kinshasa (FIH) → Paris (CDG)",
        "Kinshasa (FIH) → Bruxelles (BRU)",
        "Kinshasa (FIH) → Dubaï (DXB)",
      ],
    },
    pricingFr: {
      economy: "Les tarifs Économie varient selon la destination, la saison et la disponibilité.",
      business: "Les tarifs Affaires offrent un meilleur confort et des services premium supplémentaires.",
      bestTime: "Réserve à l'avance (2 à 4 mois) pour obtenir les meilleurs tarifs.",
      lowSeason: "Les périodes creuses hors vacances scolaires et fêtes offrent généralement des tarifs plus bas.",
      tips: [
        "Utilise Sensei Flights pour comparer les dates et trouver le meilleur prix.",
        "Paye en 3 ou 6 fois avec Sensei Pay — sans intérêts.",
        "Ajoute les bagages en avance pour économiser.",
      ],
    },
    howToBookFr: [
      "Indique ton aéroport de départ, ta destination et tes dates.",
      "Compare les vols disponibles.",
      "Sélectionne ta classe de cabine.",
      "Ajoute les extras souhaités.",
      "Finalise avec Sensei Pay ou paiement comptant.",
    ],
    cabinClassesFr: [
      { name: "Classe Économique", features: ["Sièges confortables avec divertissement en vol.", "Repas inclus sur la plupart des long-courriers.", "Franchise bagages standard."] },
      { name: "Classe Affaires", features: ["Fauteuils larges avec plus d'espace.", "Service premium et repas à la carte.", "Franchise bagages supérieure."] },
    ],
    baggageFr: {
      carryon: ["Généralement 1 pièce × 7–10 kg en cabine"],
      checked: ["Économie : 20–23 kg", "Affaires : 30–40 kg selon la compagnie"],
    },
    faqFr: [
      { q: "Comment réserver ce vol via Sensei Flights ?", a: "Utilise le formulaire de recherche ci-dessus, sélectionne ton vol, choisis ta cabine et finalise avec le mode de paiement de ton choix, y compris Sensei Pay en plusieurs fois." },
      { q: "Puis-je payer en plusieurs fois ?", a: "Oui — Sensei Pay te permet de payer en 3 ou 6 versements sans intérêts avec confirmation immédiate de ton billet." },
      { q: "Quel est le délai avant le départ pour réserver ?", a: "Tu peux réserver jusqu'à quelques heures avant le départ, mais les meilleurs prix sont obtenus 2 à 4 mois à l'avance." },
    ],
    similarSlugs: ["emirates", "qatar-airways", "turkish-airlines", "lufthansa"],
  };
}
