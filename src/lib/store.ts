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

export function generateSlots(date: Date, duration = 45): string[] {
  const day = date.getDay();
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

export function buildWhatsAppMessage(booking: Booking): string {
  const fear = booking.fearOfWater ? "⚠️ *FEAR OF WATER*" : "No fear";
  const location =
    booking.location === "Other" ? `Other: ${booking.otherLocation}` : booking.location;

  return encodeURIComponent(
    `🏊 *New Booking - Relax Fix UAE*\n\n` +
      `Status: ${fear}\n` +
      `Name: ${booking.name}\n` +
      `Phone: ${booking.phone}\n` +
      `Gender: ${booking.gender}\n` +
      `Category: ${booking.category}\n` +
      `Location: ${location}\n` +
      `Swam before: ${booking.swamBefore ? "Yes" : "No"}\n` +
      `Training: ${booking.trainingType}\n` +
      `Slot: ${booking.slot}\n`,
  );
}
