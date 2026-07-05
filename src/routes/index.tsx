import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, ShieldCheck, Users, Award, Waves, CheckCircle2, MessageCircle } from "lucide-react";
import heroImg from "../assets/hero-pool.jpg";
import { useLang } from "../lib/i18n";
import { addBooking, buildWhatsAppMessage, generateSlots, getConfig, type Booking } from "../lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relax Fix UAE — Coach Ayman | Swimming Academy Abu Dhabi" },
      { name: "description", content: "Book swimming lessons in Abu Dhabi with Coach Ayman. Opening offer 150 AED / 45 min. Free first assessment." },
    ],
  }),
  component: Home,
});

function Home() {
  const { tr, lang, dir } = useLang();
  const cfg = getConfig();
  const [form, setForm] = useState({
    name: "", phone: "", gender: "", category: "", location: "", otherLocation: "",
    swamBefore: "", afraid: "", trainingType: "", slot: "", agree: false,
  });
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [date] = useState(new Date());

  const slots = useMemo(() => generateSlots(date, cfg.duration), [date, cfg.duration]);
  const isOther = form.location === "Other";

  const canSubmit =
    form.name && form.phone && form.gender && form.category && form.location &&
    (!isOther || form.otherLocation) && form.swamBefore && form.afraid &&
    form.trainingType && form.slot && form.agree;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const b: Booking = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fearOfWater: form.afraid === "yes",
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      category: form.category,
      location: form.location,
      otherLocation: isOther ? form.otherLocation : undefined,
      swamBefore: form.swamBefore === "yes",
      trainingType: form.trainingType,
      slot: form.slot,
      status: "pending",
    };
    addBooking(b);
    setSubmitted(b);
    // Fire webhook (placeholder — user configures endpoint later)
    const wa = `https://wa.me/971551378660?text=${buildWhatsAppMessage(b)}`;
    window.open(wa, "_blank");
    setTimeout(() => document.getElementById("success")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  const input = "w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm";
  const label = "block text-sm font-semibold mb-2";

  return (
    <div dir={dir}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Pool" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/90 text-[color:var(--deep)] text-xs sm:text-sm font-bold mb-6 shadow-gold animate-float-in">
            <Sparkles className="w-4 h-4" />
            {tr("offer")}
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4 animate-float-in">
            {tr("brand")}
          </h1>
          <p className="text-lg sm:text-xl opacity-90 mb-2">{tr("tagline")}</p>
          <p className="text-xl sm:text-2xl font-semibold text-gold mb-8">{tr("slogan")}</p>
          <a href="#book" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-gold text-[color:var(--deep)] font-bold shadow-gold hover:scale-105 transition">
            <Waves className="w-5 h-5" />
            {tr("book")}
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">{tr("why")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Award, t: "feat1", d: "feat1d" },
            { icon: ShieldCheck, t: "feat2", d: "feat2d" },
            { icon: Users, t: "feat3", d: "feat3d" },
          ].map(({ icon: Icon, t, d }, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-elegant hover:-translate-y-1 transition">
              <div className="w-12 h-12 rounded-xl gradient-aqua grid place-items-center mb-4 shadow-glow">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{tr(t as any)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{tr(d as any)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING FORM */}
      <section id="book" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">{tr("bookSession")}</h2>
          <p className="text-muted-foreground">{tr("offer")}</p>
        </div>

        {submitted ? (
          <div id="success" className="p-8 rounded-2xl bg-card border-2 border-primary shadow-elegant text-center animate-float-in">
            <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">{tr("success")}</h3>
            <a
              href={`https://wa.me/971551378660?text=${buildWhatsAppMessage(submitted)}`}
              target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              {tr("contactWA")}
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-elegant space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{tr("fullName")} *</label>
                <input required className={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={label}>{tr("phone")} *</label>
                <input required type="tel" className={input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+971 5X XXX XXXX" />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className={label}>{tr("gender")} *</label>
              <div className="flex gap-3">
                {[["Male","male"],["Female","female"]].map(([val, key]) => (
                  <label key={val} className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center font-medium transition ${form.gender===val?"border-primary bg-primary/10":"border-border hover:border-primary/50"}`}>
                    <input type="radio" name="gender" className="sr-only" checked={form.gender===val} onChange={() => setForm({...form, gender: val})} />
                    {tr(key as any)}
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={label}>{tr("category")} *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["Boy","boy"],["Girl","girl"],["Adult","adult"],["People of Determination","pod"]].map(([val, key]) => (
                  <label key={val} className={`cursor-pointer px-3 py-3 rounded-xl border-2 text-center text-sm font-medium transition ${form.category===val?"border-primary bg-primary/10":"border-border hover:border-primary/50"}`}>
                    <input type="radio" name="category" className="sr-only" checked={form.category===val} onChange={() => setForm({...form, category: val})} />
                    {tr(key as any)}
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={label}>{tr("neighborhood")} *</label>
              <select required className={input} value={form.location} onChange={e => setForm({...form, location: e.target.value, otherLocation: ""})}>
                <option value="">—</option>
                {cfg.locations.map(l => <option key={l} value={l}>{l}</option>)}
                <option value="Other">{tr("other")}</option>
              </select>
              {isOther && (
                <div className="mt-3 animate-float-in">
                  <label className={label}>{tr("otherLabel")} *</label>
                  <input required className={input} value={form.otherLocation} onChange={e => setForm({...form, otherLocation: e.target.value})} />
                </div>
              )}
            </div>

            {/* Psychological */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{tr("swamBefore")} *</label>
                <div className="flex gap-2">
                  {["yes","no"].map(v => (
                    <label key={v} className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center text-sm font-medium transition ${form.swamBefore===v?"border-primary bg-primary/10":"border-border"}`}>
                      <input type="radio" name="swam" className="sr-only" checked={form.swamBefore===v} onChange={() => setForm({...form, swamBefore: v})} />
                      {tr(v as any)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={label}>{tr("afraid")} *</label>
                <div className="flex gap-2">
                  {["yes","no"].map(v => (
                    <label key={v} className={`flex-1 cursor-pointer px-4 py-3 rounded-xl border-2 text-center text-sm font-medium transition ${form.afraid===v?(v==="yes"?"border-destructive bg-destructive/10":"border-primary bg-primary/10"):"border-border"}`}>
                      <input type="radio" name="afraid" className="sr-only" checked={form.afraid===v} onChange={() => setForm({...form, afraid: v})} />
                      {tr(v as any)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Training type */}
            <div>
              <label className={label}>{tr("trainingType")} *</label>
              <div className="grid gap-2">
                {[["Private","private"],["Semi-Private","semi"],["Group","group"]].map(([val, key]) => (
                  <label key={val} className={`cursor-pointer px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${form.trainingType===val?"border-primary bg-primary/10":"border-border hover:border-primary/50"}`}>
                    <input type="radio" name="tt" className="sr-only" checked={form.trainingType===val} onChange={() => setForm({...form, trainingType: val})} />
                    {tr(key as any)}
                  </label>
                ))}
              </div>
            </div>

            {/* Slot */}
            <div>
              <label className={label}>{tr("slot")} * — {date.toLocaleDateString(lang==="ar"?"ar-AE":"en-US", { weekday:"long", day:"numeric", month:"long" })}</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slots.map(s => (
                  <button type="button" key={s} onClick={() => setForm({...form, slot: s})}
                    className={`px-2 py-2 rounded-lg border-2 text-sm font-mono transition ${form.slot===s?"border-primary bg-primary text-primary-foreground":"border-border hover:border-primary/50"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-muted border border-border">
              <div className="font-bold mb-2 text-sm">{tr("disclaimer")}</div>
              <p className="text-xs leading-relaxed text-muted-foreground mb-3">{tr("disclaimerText")}</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required checked={form.agree} onChange={e => setForm({...form, agree: e.target.checked})} className="mt-1 w-5 h-5 accent-primary" />
                <span className="text-sm font-semibold">{tr("agree")}</span>
              </label>
            </div>

            <button type="submit" disabled={!canSubmit}
              className="w-full py-4 rounded-xl gradient-gold text-[color:var(--deep)] font-bold text-lg shadow-gold hover:scale-[1.01] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {tr("submit")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
