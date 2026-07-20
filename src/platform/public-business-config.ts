export const OPERATIONAL_EMAIL = "relaxfix2026@gmail.com";
export const WHATSAPP_NUMBER = "971551378660";
export const WHATSAPP_DISPLAY = "+971551378660";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const BUSINESS_TIMEZONE = "Asia/Dubai";
export const N8N_TECHNICAL_ACCOUNT = "swimmingayman@gmail.com";

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
  displayName: string;
  googleMapsObservedName: string;
  shortUrl: string;
  resolvedUrl: string;
  placeId: string | null;
  verificationStatus: "verified-browser-redirect" | "owner-approved-hidden-duplicate";
  lastVerifiedAt: string;
  isPublic: boolean;
  bookingEnabled: boolean;
  localSeoEnabled: boolean;
  status: TrainingLocationStatus;
};

export const DISPLAY_NAME_OWNER_APPROVED = "Najda Street";
export const GOOGLE_MAPS_NAME = "ICS Al Danah - International Community School";

export const TRAINING_LOCATION_REGISTRY: readonly TrainingLocation[] = [
  {
    id: "najda-street",
    displayName: DISPLAY_NAME_OWNER_APPROVED,
    googleMapsObservedName: GOOGLE_MAPS_NAME,
    shortUrl: "https://maps.app.goo.gl/XL9weMpSJcpVDNCV6?g_st=ac",
    resolvedUrl:
      "https://www.google.com/maps/place/F9PG%2BR56+ICS+Al+Danah+-+International+Community+School+-+Al+Najda+st+-+Al+Danah+-+E11+-+Abu+Dhabi",
    placeId: null,
    verificationStatus: "verified-browser-redirect",
    lastVerifiedAt: "2026-07-20T08:27:00+04:00",
    isPublic: true,
    bookingEnabled: true,
    localSeoEnabled: true,
    status: "limited-availability",
  },
  {
    id: "ics-al-falah",
    displayName: "ICS Al Falah",
    googleMapsObservedName: "International Community Schools - ICS Al Falah City",
    shortUrl: "https://maps.app.goo.gl/b5LULVrArcD8BwhF9?g_st=ac",
    resolvedUrl:
      "https://www.google.com/maps/place/International+Community+Schools+-+ICS+Al+Falah+City+-+Suhail+Bilqaz+Al+Muhairi+St+-+Al+Falah+-+1E+-+Abu+Dhabi",
    placeId: null,
    verificationStatus: "verified-browser-redirect",
    lastVerifiedAt: "2026-07-20T08:27:00+04:00",
    isPublic: true,
    bookingEnabled: true,
    localSeoEnabled: true,
    status: "limited-availability",
  },
  {
    id: "ics-khalifa",
    displayName: "ICS Khalifa",
    googleMapsObservedName: "International Community Schools - ICS Khalifa City",
    shortUrl: "https://maps.app.goo.gl/cbWqzLqDSYXmEFyS9?g_st=ac",
    resolvedUrl:
      "https://www.google.com/maps/place/International+Community+Schools+-+ICS+Khalifa+City+-+Khalifa+City+-+SE38+-+Abu+Dhabi",
    placeId: null,
    verificationStatus: "verified-browser-redirect",
    lastVerifiedAt: "2026-07-20T08:27:00+04:00",
    isPublic: true,
    bookingEnabled: true,
    localSeoEnabled: true,
    status: "limited-availability",
  },
  {
    id: "ics-mushrif",
    displayName: "ICS Mushrif",
    googleMapsObservedName: "International Community Schools - ICS Mushrif",
    shortUrl: "https://maps.app.goo.gl/Rgu2vKH7JDigAQQx6?g_st=ac",
    resolvedUrl:
      "https://www.google.com/maps/place/International+Community+Schools+-+ICS+Mushrif+-+24th+Street,+Al+Mushrif+Area+-+Abu+Dhabi",
    placeId: null,
    verificationStatus: "verified-browser-redirect",
    lastVerifiedAt: "2026-07-20T08:27:00+04:00",
    isPublic: true,
    bookingEnabled: true,
    localSeoEnabled: true,
    status: "limited-availability",
  },
  {
    id: "ics-al-danah",
    displayName: "ICS Al Danah",
    googleMapsObservedName: GOOGLE_MAPS_NAME,
    shortUrl: "https://maps.app.goo.gl/2ezLYdDSGLqeVkoNA",
    resolvedUrl:
      "https://www.google.com/maps/place/F9PG%2BR56+ICS+Al+Danah+-+International+Community+School+-+Al+Najda+st+-+Al+Danah+-+E11+-+Abu+Dhabi",
    placeId: null,
    verificationStatus: "owner-approved-hidden-duplicate",
    lastVerifiedAt: "2026-07-20T08:27:00+04:00",
    isPublic: false,
    bookingEnabled: false,
    localSeoEnabled: false,
    status: "temporarily-unavailable",
  },
] as const;

export const TRAINING_LOCATIONS = TRAINING_LOCATION_REGISTRY.filter(
  (location) => location.isPublic,
);

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
