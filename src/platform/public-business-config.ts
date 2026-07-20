export const OPERATIONAL_EMAIL = "relaxfix2026@gmail.com";
export const WHATSAPP_NUMBER = "971551378660";
export const WHATSAPP_DISPLAY = "+971551378660";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const BUSINESS_TIMEZONE = "Asia/Dubai";

export const PUBLIC_PRICING = {
  groupMaxSize: 4,
  groupChildPriceAED: 450,
  siblingChildPriceAED: 400,
  aquaticSessionPriceAED: 150,
  landSessionPriceAED: 150,
} as const;

export const GENERAL_AVAILABILITY = {
  weekend: {
    days: [0, 6],
    start: "10:00",
    end: "22:00",
    ar: "السبت والأحد: 10:00 صباحًا – 10:00 مساءً",
    en: "Saturday and Sunday: 10:00 AM – 10:00 PM",
  },
  weekdays: {
    days: [1, 2, 3, 4, 5],
    start: "16:00",
    end: "21:00",
    ar: "من الاثنين إلى الجمعة: 4:00 عصرًا – 9:00 مساءً",
    en: "Monday to Friday: 4:00 PM – 9:00 PM",
  },
} as const;

export type TrainingLocationStatus =
  "available" | "limited-availability" | "temporarily-unavailable";

export type TrainingLocation = {
  id: string;
  name: string;
  mapsUrl: string;
  status: TrainingLocationStatus;
};

export const TRAINING_LOCATIONS: readonly TrainingLocation[] = [
  {
    id: "ics-al-najda",
    name: "ICS Al Najda",
    mapsUrl: "https://maps.app.goo.gl/XL9weMpSJcpVDNCV6?g_st=ac",
    status: "limited-availability",
  },
  {
    id: "ics-al-falah",
    name: "ICS Al Falah",
    mapsUrl: "https://maps.app.goo.gl/b5LULVrArcD8BwhF9?g_st=ac",
    status: "limited-availability",
  },
  {
    id: "ics-khalifa",
    name: "ICS Khalifa",
    mapsUrl: "https://maps.app.goo.gl/cbWqzLqDSYXmEFyS9?g_st=ac",
    status: "limited-availability",
  },
  {
    id: "ics-mushrif",
    name: "ICS Mushrif",
    mapsUrl: "https://maps.app.goo.gl/Rgu2vKH7JDigAQQx6?g_st=ac",
    status: "limited-availability",
  },
  {
    id: "ics-al-danah",
    name: "ICS Al Danah",
    mapsUrl: "https://maps.app.goo.gl/2ezLYdDSGLqeVkoNA",
    status: "limited-availability",
  },
] as const;

export function generalHoursForWeekday(weekday: number) {
  return GENERAL_AVAILABILITY.weekend.days.includes(weekday as 0 | 6)
    ? GENERAL_AVAILABILITY.weekend
    : GENERAL_AVAILABILITY.weekdays;
}

export function isWithinGeneralAvailability(
  weekday: number,
  startTime: string,
  durationMinutes: number,
): boolean {
  const hours = generalHoursForWeekday(weekday);
  const [hour, minute] = startTime.split(":").map(Number);
  const [startHour, startMinute] = hours.start.split(":").map(Number);
  const [endHour, endMinute] = hours.end.split(":").map(Number);
  if (![hour, minute, startHour, startMinute, endHour, endMinute].every(Number.isFinite)) {
    return false;
  }

  const requestedStart = hour * 60 + minute;
  const requestedEnd = requestedStart + durationMinutes;
  const allowedStart = startHour * 60 + startMinute;
  const allowedEnd = endHour * 60 + endMinute;
  return requestedStart >= allowedStart && requestedEnd <= allowedEnd;
}

export function operationalWhatsAppUrl(message?: string): string {
  return message ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}` : WHATSAPP_URL;
}
