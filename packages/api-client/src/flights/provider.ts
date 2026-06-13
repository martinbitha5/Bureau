/**
 * Abstraction de l'inventaire vols (docs/INTEGRATIONS.md §5). Le reste ne connaît que
 * `FlightProvider`. V1 = `MockFlightProvider` (offres déterministes). Le jour où l'on
 * branche Duffel/Amadeus, on implémente l'interface sans toucher au code appelant.
 */

export interface FlightSearchParams {
  origin: string; // IATA
  destination: string; // IATA
  departDate: string; // YYYY-MM-DD
  returnDate?: string | null;
  passengers: number;
  cabin: "economy" | "premium" | "business";
}

export interface FlightSegment {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  carrier: string;
  flightNumber: string;
}

export interface FlightOffer {
  providerOfferId: string;
  provider: string;
  totalCents: number; // cents USD
  currency: "USD";
  expiresAt: string; // ISO
  segments: FlightSegment[];
}

export interface FlightProvider {
  readonly name: string;
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
}

/** Génère des offres factices déterministes pour la V1 / les démos / les tests. */
export class MockFlightProvider implements FlightProvider {
  readonly name = "mock";

  async search(params: FlightSearchParams): Promise<FlightOffer[]> {
    const basePrices = [38_500, 45_000, 61_900]; // 385 $, 450 $, 619 $
    const carriers = [
      { carrier: "Congo Airways", code: "8Z" },
      { carrier: "Ethiopian Airlines", code: "ET" },
      { carrier: "Kenya Airways", code: "KQ" },
    ];
    const expiresAt = new Date(Date.now() + 30 * 60_000).toISOString(); // +30 min
    return basePrices.map((price, i) => {
      const c = carriers[i % carriers.length]!;
      return {
        providerOfferId: `mock-${params.origin}-${params.destination}-${i}`,
        provider: this.name,
        totalCents: price * params.passengers,
        currency: "USD",
        expiresAt,
        segments: [
          {
            from: params.origin,
            to: params.destination,
            departAt: `${params.departDate}T08:${10 + i}:00Z`,
            arriveAt: `${params.departDate}T13:${30 + i}:00Z`,
            carrier: c.carrier,
            flightNumber: `${c.code}${100 + i}`,
          },
        ],
      };
    });
  }
}
