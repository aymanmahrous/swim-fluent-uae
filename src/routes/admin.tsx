import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Trash2, Plus, LogOut, Save } from "lucide-react";
import { useLang } from "../lib/i18n";
import { deleteBooking, getBookings, getConfig, saveConfig, updateBooking, type Booking, type Config } from "../lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Relax Fix UAE" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const PASSWORD = "ayman2026";

function Admin() {
  const { tr, dir } = useLang();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cfg, setCfg] = useState<Config>({ price: 150, duration: 45, locations: [] });
  const [newLoc, setNewLoc] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("rfx_admin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setBookings(getBookings());
    setCfg(getConfig());
  }, [authed]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass === PASSWORD) { sessionStorage.setItem("rfx_admin","1"); setAuthed(true); setErr(false); }
    else setErr(true);
  }

  function refreshBookings() { setBookings(getBookings()); }
  function saveCfg() { saveConfig(cfg); }

  if (!authed) {
    return (
      <div dir={dir} className="min-h-[70vh] grid place-items-center px-6">
        <form onSubmit={login} className="w-full max-w-sm p-8 rounded-2xl bg-card border border-border shadow-elegant">
          <div className="w-14 h-14 rounded-2xl gradient-aqua grid place-items-center mx-auto mb-4 shadow-glow">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">{tr("adminLogin")}</h1>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder={tr("password")}
            className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none mb-3" />
          {err && <p className="text-sm text-destructive mb-3">{tr("wrongPass")}</p>}
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">{tr("login")}</button>
        </form>
      </div>
    );
  }

  return (
    <div dir={dir} className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{tr("admin")}</h1>
        <button onClick={() => { sessionStorage.removeItem("rfx_admin"); setAuthed(false); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
          <LogOut className="w-4 h-4" /> {tr("logout")}
        </button>
      </div>

      {/* Pricing */}
      <section className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-elegant">
        <h2 className="text-xl font-bold mb-4">{tr("pricing")}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{tr("price")}</label>
            <input type="number" value={cfg.price} onChange={e => setCfg({...cfg, price: +e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-input border border-border" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{tr("duration")}</label>
            <input type="number" value={cfg.duration} onChange={e => setCfg({...cfg, duration: +e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-input border border-border" />
          </div>
          <div className="flex items-end">
            <button onClick={saveCfg} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {tr("save")}
            </button>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="mb-8 p-6 rounded-2xl bg-card border border-border shadow-elegant">
        <h2 className="text-xl font-bold mb-4">{tr("locations")}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {cfg.locations.map(l => (
            <span key={l} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm">
              {l}
              <button onClick={() => { const c={...cfg, locations: cfg.locations.filter(x=>x!==l)}; setCfg(c); saveConfig(c); }}
                className="text-destructive hover:opacity-70"><Trash2 className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="Location name"
            className="flex-1 px-4 py-2.5 rounded-xl bg-input border border-border" />
          <button onClick={() => { if(!newLoc.trim()) return; const c={...cfg, locations:[...cfg.locations, newLoc.trim()]}; setCfg(c); saveConfig(c); setNewLoc(""); }}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> {tr("addLocation")}
          </button>
        </div>
      </section>

      {/* Bookings */}
      <section className="p-6 rounded-2xl bg-card border border-border shadow-elegant">
        <h2 className="text-xl font-bold mb-4">{tr("bookings")} ({bookings.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-2">{tr("status")}</th>
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Gender</th>
                <th className="p-2">Category</th>
                <th className="p-2">Location</th>
                <th className="p-2">Training</th>
                <th className="p-2">Slot</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className={`p-2 font-bold ${b.fearOfWater ? "text-destructive" : "text-muted-foreground"}`}>
                    {b.fearOfWater ? tr("fearYes") : tr("noFear")}
                  </td>
                  <td className="p-2">{b.name}</td>
                  <td className="p-2 font-mono">{b.phone}</td>
                  <td className="p-2">{b.gender}</td>
                  <td className="p-2">{b.category}</td>
                  <td className="p-2">{b.location === "Other" ? `${b.location}: ${b.otherLocation}` : b.location}</td>
                  <td className="p-2">{b.trainingType}</td>
                  <td className="p-2 font-mono">{b.slot}</td>
                  <td className="p-2 flex gap-1">
                    <select value={b.status} onChange={e => { updateBooking(b.id, { status: e.target.value as any }); refreshBookings(); }}
                      className="px-2 py-1 rounded border border-border bg-background text-xs">
                      <option value="pending">{tr("pending")}</option>
                      <option value="confirmed">{tr("confirmed")}</option>
                      <option value="completed">{tr("completed")}</option>
                    </select>
                    <button onClick={() => { deleteBooking(b.id); refreshBookings(); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">—</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
