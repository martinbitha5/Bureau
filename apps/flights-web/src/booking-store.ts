/**
 * Stockage local des réservations invité (modèle sans compte, façon Alternative Airlines).
 * Noms de champs alignés sur docs/DATA_DICTIONARY.md §7.3 / §7.4.
 */

export type PassengerTitle = "mr" | "mrs" | "ms" | "mx";
export type BookingStatus = "pending_payment" | "confirmed" | "cancelled";
export type ContactChannel = "email" | "sms";
export type SeatPref = "window" | "aisle" | "choose" | "random";

// ─── Types passager / contact ─────────────────────────────────────────────────

export interface PassengerDraft {
  title: PassengerTitle;
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  type: "adult" | "child" | "infant";
}

export interface ContactDraft {
  full_name: string;
  contact_email: string;
  contact_phone: string;
  contact_opt_in: boolean;
  contact_channel: ContactChannel;
}

// ─── Personnalisation ─────────────────────────────────────────────────────────

export interface CustomiseDraft {
  seat_pref: SeatPref;
  selected_extra_ids: string[];
  bundle_discount: boolean;
}

// ─── Protection ───────────────────────────────────────────────────────────────

export interface ProtectDraft {
  cancellation_protection: boolean;
  baggage_protection: boolean;
}

// ─── Brouillon global (contact + passagers) ───────────────────────────────────

export interface BookingDraft {
  contact: ContactDraft;
  passengers: PassengerDraft[];
}

// ─── Vol sélectionné ─────────────────────────────────────────────────────────

export interface FlightLeg {
  from: string;
  to: string;
  departDate: string;
  departTime: string;
  arriveTime: string;
  carrier: string;
  flightNumber: string;
}

// ─── Réservation confirmée ───────────────────────────────────────────────────

export interface BookingRecord {
  booking_ref: string;
  provider_booking_ref: string | null;
  status: BookingStatus;
  total_cents: number;
  currency: "USD";
  trip_type: "round" | "oneway";
  cabin: "economy" | "premium" | "business";
  outbound: FlightLeg;
  inbound: FlightLeg | null;
  contact: ContactDraft;
  passengers: PassengerDraft[];
  customise: CustomiseDraft | null;
  protect: ProtectDraft | null;
  created_at: string;
}

// ─── Clés localStorage ───────────────────────────────────────────────────────

const DRAFT_KEY = "sensei.flights.draft";
const CUSTOMISE_KEY = "sensei.flights.customise";
const PROTECT_KEY = "sensei.flights.protect";
const BOOKINGS_KEY = "sensei.flights.bookings";

// ─── Contact + passagers ─────────────────────────────────────────────────────

export function saveDraft(draft: BookingDraft): void {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

export function loadDraft(): BookingDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch { return null; }
}

export function clearDraft(): void {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

// ─── Personnalisation ─────────────────────────────────────────────────────────

export function saveCustomise(draft: CustomiseDraft): void {
  try { localStorage.setItem(CUSTOMISE_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

export function loadCustomise(): CustomiseDraft | null {
  try {
    const raw = localStorage.getItem(CUSTOMISE_KEY);
    return raw ? (JSON.parse(raw) as CustomiseDraft) : null;
  } catch { return null; }
}

export function clearCustomise(): void {
  try { localStorage.removeItem(CUSTOMISE_KEY); } catch { /* ignore */ }
}

// ─── Protection ───────────────────────────────────────────────────────────────

export function saveProtect(draft: ProtectDraft): void {
  try { localStorage.setItem(PROTECT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
}

export function loadProtect(): ProtectDraft | null {
  try {
    const raw = localStorage.getItem(PROTECT_KEY);
    return raw ? (JSON.parse(raw) as ProtectDraft) : null;
  } catch { return null; }
}

export function clearProtect(): void {
  try { localStorage.removeItem(PROTECT_KEY); } catch { /* ignore */ }
}

// ─── Réservations confirmées ──────────────────────────────────────────────────

function readBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as BookingRecord[]) : [];
  } catch { return []; }
}

export function saveBooking(record: BookingRecord): void {
  try {
    const all = readBookings().filter((b) => b.booking_ref !== record.booking_ref);
    all.unshift(record);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export function findBooking(bookingRef: string, email: string): BookingRecord | null {
  const ref = bookingRef.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  return (
    readBookings().find(
      (b) =>
        b.booking_ref.toUpperCase() === ref &&
        b.contact.contact_email.toLowerCase() === mail,
    ) ?? null
  );
}

export function clearAllDrafts(): void {
  clearDraft();
  clearCustomise();
  clearProtect();
}

// ─── Génération de référence ─────────────────────────────────────────────────

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  return s;
}

export function generateBookingRef(): string {
  return `SN-${randomBlock(3)}-${randomBlock(5)}`;
}

// ─── Calcul du total global (vol + siège + extras + protection) ───────────────

export const SEAT_PRICES: Record<SeatPref, number> = {
  window: 2800,
  aisle: 2800,
  choose: 2800,
  random: 0,
};

export const EXTRAS_CATALOG = [
  { id: "flight_comp", price_cents: 2000 },
  { id: "travel_alerts", price_cents: 500 },
  { id: "lounge", price_cents: 4300 },
  { id: "weather", price_cents: 300 },
] as const;

export const CANCEL_PRICE_CENTS = 1000;
export const BAGS_PROT_PRICE_CENTS = 1600;

export function calcExtrasTotal(c: CustomiseDraft | null): number {
  if (!c) return 0;
  const raw = c.selected_extra_ids.reduce((s, id) => {
    const e = EXTRAS_CATALOG.find((x) => x.id === id);
    return s + (e?.price_cents ?? 0);
  }, 0);
  return c.bundle_discount ? raw - Math.floor(raw * 0.01) : raw;
}

export function calcGrandTotal(
  flightCents: number,
  c: CustomiseDraft | null,
  p: ProtectDraft | null,
): number {
  const seat = c ? SEAT_PRICES[c.seat_pref] : 0;
  const extras = calcExtrasTotal(c);
  const cancel = p?.cancellation_protection ? CANCEL_PRICE_CENTS : 0;
  const bags = p?.baggage_protection ? BAGS_PROT_PRICE_CENTS : 0;
  return flightCents + seat + extras + cancel + bags;
}
