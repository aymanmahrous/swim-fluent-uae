export interface Booking {
  id: string;
  createdAt: string;
  fearOfWater: boolean;
  name: string;
  phone: string;
  gender: string;
  category: string;
  location: string;
  otherLocation?: string;
  swamBefore: boolean;
  trainingType: string;
  slot: string;
  status: "pending" | "confirmed" | "completed";
}

export interface Config {
  price: number;
  duration: number;
  locations: string[];
}

const BK = "rfx_bookings";
const CF = "rfx_config";

export const defaultConfig: Config = {
  price: 150,
  duration: 45,
  locations: [
    "Al Muroor",
    "Al Ma'amoor",
    "Al Khalidiya",
    "Al Falah",
    "Electra",
    "Al Reem Island",
    "Yas Island",
  ],
};

export function getConfig(): Config {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const raw = localStorage.getItem(CF);
    return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}
export function saveConfig(c: Config) {
  localStorage.setItem(CF, JSON.stringify(c));
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BK) || "[]");
  } catch {
    return [];
  }
}
export function addBooking(b: Booking) {
  const all = getBookings();
  all.unshift(b);
  localStorage.setItem(BK, JSON.stringify(all));
}
export function updateBooking(id: string, patch: Partial<Booking>) {
  const all = getBookings().map((b) => (b.id === id ? { ...b, ...patch } : b));
  localStorage.setItem(BK, JSON.stringify(all));
}
export function deleteBooking(id: string) {
  localStorage.setItem(BK, JSON.stringify(getBookings().filter((b) => b.id !== id)));
}

// Generate time slots based on day-of-week
export function generateSlots(date: Date, duration = 45): string[] {
  const day = date.getDay(); // 0=Sun 1=Mon ... 6=Sat
  const ranges: [number, number][] = [];
  if (day === 1)
    ranges.push([16, 21]); // Mon 4pm-9pm
  else if (day === 0 || day === 6)
    ranges.push([18, 22]); // Sat/Sun 6pm-10pm
  else if (day === 2 || day === 4 || day === 5) {
    ranges.push([13, 15]);
    ranges.push([19, 22]);
  } else ranges.push([16, 21]);
  const slots: string[] = [];
  for (const [start, end] of ranges) {
    let m = start * 60;
    while (m + duration <= end * 60) {
      const h = Math.floor(m / 60),
        mm = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
      m += duration;
    }
  }
  return slots;
}

export function buildWhatsAppMessage(b: Booking): string {
  const fear = b.fearOfWater ? "⚠️ *FEAR OF WATER*" : "No fear";
  const loc = b.location === "Other" ? `Other: ${b.otherLocation}` : b.location;
  return encodeURIComponent(
    `🏊 *New Booking - Relax Fix UAE*\n\n` +
      `Status: ${fear}\n` +
      `Name: ${b.name}\n` +
      `Phone: ${b.phone}\n` +
      `Gender: ${b.gender}\n` +
      `Category: ${b.category}\n` +
      `Location: ${loc}\n` +
      `Swam before: ${b.swamBefore ? "Yes" : "No"}\n` +
      `Training: ${b.trainingType}\n` +
      `Slot: ${b.slot}\n`,
  );
}
