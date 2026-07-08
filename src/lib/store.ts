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
  requestedDate: string;
  slot: string;
  status: "pending" | "confirmed" | "completed";
}

function slotsForDay(day: number, duration: number): string[] {
  const ranges: [number, number][] = [];

  if (day === 1) ranges.push([16, 21]);
  else if (day === 0 || day === 6) ranges.push([18, 22]);
  else if (day === 2 || day === 4 || day === 5) {
    ranges.push([13, 15]);
    ranges.push([19, 22]);
  } else ranges.push([16, 21]);

  const slots: string[] = [];
  for (const [start, end] of ranges) {
    let minutes = start * 60;
    while (minutes + duration <= end * 60) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      minutes += duration;
    }
  }

  return slots;
}

export function generateSlots(date: Date, duration = 45): string[] {
  return slotsForDay(date.getDay(), duration);
}

export function generateSlotsForDubaiDate(dateString: string, duration = 45): string[] {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return [];
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  return slotsForDay(weekday, duration);
}

export function buildWhatsAppMessage(booking: Booking): string {
  const fear = booking.fearOfWater ? "FEAR OF WATER" : "No fear";
  const location =
    booking.location === "Other" ? `Other: ${booking.otherLocation}` : booking.location;

  return encodeURIComponent(
    `New Booking - Relax Fix UAE\n\n` +
      `Status: ${fear}\n` +
      `Name: ${booking.name}\n` +
      `Phone: ${booking.phone}\n` +
      `Gender: ${booking.gender}\n` +
      `Category: ${booking.category}\n` +
      `Location: ${location}\n` +
      `Swam before: ${booking.swamBefore ? "Yes" : "No"}\n` +
      `Training: ${booking.trainingType}\n` +
      `Date: ${booking.requestedDate}\n` +
      `Slot: ${booking.slot}\n`,
  );
}
