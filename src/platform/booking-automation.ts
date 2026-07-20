import { z } from "zod";
import {
  BUSINESS_TIMEZONE,
  N8N_TECHNICAL_ACCOUNT,
  OPERATIONAL_EMAIL,
  TRAINING_LOCATIONS,
  isWithinGeneralAvailability,
} from "./public-business-config";

export const bookingAutomationFlags = {
  calendarEnabled: import.meta.env.VITE_ENABLE_CALENDAR_BOOKING === "true",
  emailEnabled: import.meta.env.VITE_ENABLE_BOOKING_EMAIL === "true",
  n8nEnabled: import.meta.env.VITE_ENABLE_N8N_BOOKING === "true",
  testMode: import.meta.env.VITE_BOOKING_AUTOMATION_TEST_MODE !== "false",
} as const;

export const BookingAutomationRequestSchema = z.object({
  bookingReference: z.string().regex(/^RF-[A-Z0-9-]{4,32}$/),
  idempotencyKey: z.string().min(8).max(128),
  locationId: z.enum(TRAINING_LOCATIONS.map((location) => location.id) as [string, ...string[]]),
  service: z.enum(["children-small-group", "aquatic-movement", "land-movement"]),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().positive().max(240),
  language: z.enum(["ar", "en"]),
  status: z.enum([
    "requested",
    "calendar-checked",
    "pending-human-review",
    "confirmed",
    "cancelled",
  ]),
});

export type BookingAutomationRequest = z.infer<typeof BookingAutomationRequestSchema>;

export function safeCalendarTitle(bookingReference: string) {
  return `Initial Assessment — Booking ${bookingReference}`;
}

export function validateGeneralBookingWindow(input: {
  requestedDate: string;
  requestedTime: string;
  durationMinutes: number;
}) {
  const [year, month, day] = input.requestedDate.split("-").map(Number);
  if (!year || !month || !day) return false;
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  return isWithinGeneralAvailability(weekday, input.requestedTime, input.durationMinutes);
}

export const calendarAvailabilityContract = {
  operationalAccount: OPERATIONAL_EMAIL,
  n8nTechnicalAccount: N8N_TECHNICAL_ACCOUNT,
  timezone: BUSINESS_TIMEZONE,
  resources: TRAINING_LOCATIONS.map((location) => ({
    id: location.id,
    displayName: location.displayName,
    bookingEnabled: location.bookingEnabled,
  })),
  requireLocationCalendar: true,
  preventDoubleBooking: true,
  requireConflictCheckBeforeDisplay: true,
  requireConflictCheckBeforeConfirmation: true,
  allowLocationClosure: true,
  allowDateClosure: true,
  allowTravelBuffer: true,
  idempotencyRequired: true,
  sensitiveDataInTitle: false,
} as const;

type Template = { subject: string; body: string };
type TemplatePair = { ar: Template; en: Template };

const signature = {
  ar: `فريق Relax Fix UAE\n${OPERATIONAL_EMAIL}`,
  en: `Relax Fix UAE Team\n${OPERATIONAL_EMAIL}`,
};

export const bookingEmailTemplates: Record<
  | "request-received"
  | "appointment-confirmed"
  | "location-changed"
  | "time-changed"
  | "appointment-cancelled"
  | "reminder"
  | "new-internal-request"
  | "slot-conflict"
  | "calendar-failure"
  | "n8n-failure"
  | "operations-report",
  TemplatePair
> = {
  "request-received": {
    ar: {
      subject: "استلمنا طلب التقييم الأولي {{bookingReference}}",
      body: `استلمنا طلبك، وسنراجع الخدمة والموقع والموعد قبل التأكيد. إرسال الطلب لا يعني أن الموعد مؤكد.\n\n${signature.ar}`,
    },
    en: {
      subject: "We received your initial assessment request {{bookingReference}}",
      body: `We received your request and will review the service, location and time before confirmation. Submitting a request does not confirm an appointment.\n\n${signature.en}`,
    },
  },
  "appointment-confirmed": {
    ar: {
      subject: "تأكيد الموعد {{bookingReference}}",
      body: `تم تأكيد الموعد بعد فحص توفر الموقع وعدم وجود تعارض.\n\n${signature.ar}`,
    },
    en: {
      subject: "Appointment confirmed {{bookingReference}}",
      body: `Your appointment was confirmed after checking location availability and conflicts.\n\n${signature.en}`,
    },
  },
  "location-changed": {
    ar: {
      subject: "تغيير موقع الموعد {{bookingReference}}",
      body: `تم تحديث موقع الموعد. راجع التفاصيل المرفقة قبل الحضور.\n\n${signature.ar}`,
    },
    en: {
      subject: "Appointment location changed {{bookingReference}}",
      body: `The appointment location was updated. Please review the supplied details before attending.\n\n${signature.en}`,
    },
  },
  "time-changed": {
    ar: {
      subject: "تعديل وقت الموعد {{bookingReference}}",
      body: `تم تحديث وقت الموعد بعد فحص التوفر.\n\n${signature.ar}`,
    },
    en: {
      subject: "Appointment time changed {{bookingReference}}",
      body: `The appointment time was updated after an availability check.\n\n${signature.en}`,
    },
  },
  "appointment-cancelled": {
    ar: {
      subject: "إلغاء الموعد {{bookingReference}}",
      body: `تم إلغاء الموعد المشار إليه. تواصل معنا إذا رغبت في تقديم طلب جديد.\n\n${signature.ar}`,
    },
    en: {
      subject: "Appointment cancelled {{bookingReference}}",
      body: `The referenced appointment was cancelled. Contact us if you would like to submit a new request.\n\n${signature.en}`,
    },
  },
  reminder: {
    ar: {
      subject: "تذكير بالموعد {{bookingReference}}",
      body: `هذا تذكير بموعدك المؤكد. راجع الموقع والوقت قبل الحضور.\n\n${signature.ar}`,
    },
    en: {
      subject: "Appointment reminder {{bookingReference}}",
      body: `This is a reminder for your confirmed appointment. Check the location and time before attending.\n\n${signature.en}`,
    },
  },
  "new-internal-request": {
    ar: {
      subject: "طلب تقييم أولي جديد {{bookingReference}}",
      body: "طلب جديد يحتاج فحص الموقع والتقويم ومراجعة بشرية قبل التأكيد.",
    },
    en: {
      subject: "New initial assessment request {{bookingReference}}",
      body: "A new request requires a location/calendar check and human review before confirmation.",
    },
  },
  "slot-conflict": {
    ar: {
      subject: "تعارض موعد {{bookingReference}}",
      body: "لم يُنشأ موعد. يجب اختيار وقت بديل بعد فحص تقويم الموقع.",
    },
    en: {
      subject: "Appointment conflict {{bookingReference}}",
      body: "No appointment was created. Choose another time after checking the location calendar.",
    },
  },
  "calendar-failure": {
    ar: {
      subject: "فشل Google Calendar {{bookingReference}}",
      body: "توقف المسار بأمان ولم يتم تأكيد الموعد. راجع السجل الآمن قبل إعادة المحاولة.",
    },
    en: {
      subject: "Google Calendar failure {{bookingReference}}",
      body: "The workflow stopped safely and did not confirm the appointment. Review the safe log before retrying.",
    },
  },
  "n8n-failure": {
    ar: {
      subject: "فشل n8n Workflow {{bookingReference}}",
      body: "توقف المسار بأمان. لا تُعد المحاولة قبل فحص حالة idempotency.",
    },
    en: {
      subject: "n8n workflow failure {{bookingReference}}",
      body: "The workflow stopped safely. Do not retry before checking idempotency state.",
    },
  },
  "operations-report": {
    ar: {
      subject: "تقرير تشغيل Relax Fix UAE",
      body: "ملخص الطلبات والتعارضات والأخطاء دون بيانات حساسة غير ضرورية.",
    },
    en: {
      subject: "Relax Fix UAE operations report",
      body: "A summary of requests, conflicts and failures without unnecessary sensitive data.",
    },
  },
};

export function automationCanPerformExternalWrites() {
  return (
    !bookingAutomationFlags.testMode &&
    bookingAutomationFlags.calendarEnabled &&
    bookingAutomationFlags.emailEnabled &&
    bookingAutomationFlags.n8nEnabled
  );
}
