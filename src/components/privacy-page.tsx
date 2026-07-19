import { Link } from "@tanstack/react-router";
import { Mail, ShieldCheck } from "lucide-react";

type PrivacyLanguage = "ar" | "en";

const copy = {
  ar: {
    title: "معلومات الخصوصية",
    intro: "توضح هذه الصفحة كيفية استخدام Relax Fix UAE للمعلومات التي يرسلها الزائر عند طلب تقييم أو حجز جلسة.",
    sections: [
      ["جهة التشغيل", "تُقدَّم الخدمة للجمهور تحت الاسم التشغيلي Relax Fix UAE وبواسطة Coach Ayman في أبوظبي، الإمارات العربية المتحدة."],
      ["المعلومات التي نطلبها", "قد يتضمن نموذج الطلب الاسم، رقم الهاتف، الفئة العامة للمتدرب، منطقة التدريب المفضلة، خبرة السباحة السابقة، الهدف التدريبي، والتاريخ والوقت المطلوبين."],
      ["سبب الاستخدام", "نستخدم المعلومات لمراجعة الطلب، التواصل مع مقدم الطلب، التحقق من ملاءمة الموعد، وتنظيم المتابعة المتعلقة بالخدمة المطلوبة فقط."],
      ["طلبات الأطفال", "يجب أن يقدم طلب الطفل أب أو أم أو ولي أمر بالغ. لا ينبغي إرسال معلومات طبية أو تشخيصية أو حساسة عبر نموذج الحجز العام."],
      ["المشاركة والحماية", "لا نضع بيانات نموذج الحجز في أنظمة الإعلانات أو التحليلات. يقتصر الوصول التشغيلي على الأشخاص المخولين بمتابعة الطلب، ولا تُستخدم البيانات لرسائل تسويقية آلية دون موافقة مناسبة."],
      ["طلبات الخصوصية", "يمكن طلب معرفة المعلومات المرتبطة بالطلب أو تصحيحها أو حذفها أو الاعتراض على استخدامها، مع مراعاة المتطلبات النظامية والفنية المطبقة."],
    ],
    contact: "أرسل طلب الخصوصية من البريد المستخدم في الطلب، واذكر الاسم ورقم الهاتف المرتبطين به لتسهيل التحقق.",
    email: "البريد الإلكتروني",
    back: "العودة إلى الموقع",
    notice: "هذه معلومات تشغيلية عامة وليست بديلاً عن استشارة قانونية متخصصة. تُراجع عند تغير طريقة جمع البيانات أو استخدامها.",
  },
  en: {
    title: "Privacy information",
    intro: "This page explains how Relax Fix UAE uses information submitted when someone requests an assessment or swimming session.",
    sections: [
      ["Service operator", "The service is presented publicly under the operating name Relax Fix UAE by Coach Ayman in Abu Dhabi, United Arab Emirates."],
      ["Information we request", "The request form may include a name, phone number, broad learner category, preferred coaching area, previous swimming experience, coaching goal, and requested date and time."],
      ["Why we use it", "We use the information to review the request, contact the requester, check appointment suitability, and manage follow-up relating only to the requested service."],
      ["Requests for children", "A request for a child must be submitted by an adult parent or guardian. Medical, diagnostic, or other sensitive information should not be sent through the public booking form."],
      ["Sharing and protection", "Booking-form data is not placed in advertising or analytics systems. Operational access is limited to authorised people, and the data is not used for automated marketing messages without appropriate consent."],
      ["Privacy requests", "You may ask about information linked to your request, request correction or deletion, or object to its use, subject to applicable legal and technical requirements."],
    ],
    contact: "Send the privacy request from the email used for the enquiry and include the related name and phone number so the request can be verified.",
    email: "Email",
    back: "Back to website",
    notice: "This is general operational information and is not a substitute for specialised legal advice. It should be reviewed whenever data collection or use changes.",
  },
} as const;

export function PrivacyPage({ language }: { language: PrivacyLanguage }) {
  const text = copy[language];
  const home = language === "ar" ? "/" : "/en";
  return (
    <main className="min-h-screen bg-muted/40 px-5 py-12 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card p-6 shadow-elegant sm:p-10">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          <span className="text-sm font-black uppercase tracking-[0.16em]">Relax Fix UAE</span>
        </div>
        <h1 className="mt-5 text-3xl font-black sm:text-5xl">{text.title}</h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{text.intro}</p>
        <div className="mt-10 grid gap-5">
          {text.sections.map(([heading, body]) => (
            <section key={heading} className="rounded-2xl border border-border bg-background p-5">
              <h2 className="text-lg font-black">{heading}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
        <section className="mt-5 rounded-2xl bg-deep p-5 text-white">
          <h2 className="text-lg font-black">{language === "ar" ? "التواصل" : "Contact"}</h2>
          <p className="mt-2 leading-7 text-white/75">{text.contact}</p>
          <a href="mailto:swimmingayman@gmail.com?subject=Privacy%20request%20-%20Relax%20Fix%20UAE" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-deep">
            <Mail className="h-4 w-4" aria-hidden="true" /> {text.email}: swimmingayman@gmail.com
          </a>
        </section>
        <p className="mt-6 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">{text.notice}</p>
        <Link to={home} className="mt-7 inline-flex rounded-xl border border-border px-5 py-3 text-sm font-black hover:bg-muted">{text.back}</Link>
      </article>
    </main>
  );
}
