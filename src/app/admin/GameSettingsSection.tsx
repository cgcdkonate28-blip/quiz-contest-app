"use client";

import { useEffect, useState } from "react";

function roundUpToNext10Min(date: Date) {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const remainder = minutes % 10;
  if (remainder !== 0 || d.getSeconds() > 0) {
    d.setMinutes(minutes - remainder + 10);
  }
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

export default function GameSettingsSection() {
  const [open, setOpen] = useState(false);
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [current, setCurrent] = useState<{ dateHeureDebut: string | null; dateHeureFin: string | null }>({ dateHeureDebut: null, dateHeureFin: null });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minDebut, setMinDebut] = useState("");

  function fetchSettings() {
    fetch("/api/admin/reglages").then((r) => r.json()).then((d) => {
      setCurrent(d);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (open && !loaded) fetchSettings();
  }, [open, loaded]);

  useEffect(() => {
    if (open) {
      const rounded = roundUpToNext10Min(new Date());
      setMinDebut(toLocalInputValue(rounded));
    }
  }, [open]);

  let minFin = minDebut;
  if (debut) {
    const debutDate = new Date(debut);
    const plus30 = new Date(debutDate.getTime() + 30 * 60000);
    const roundedFin = roundUpToNext10Min(plus30);
    minFin = toLocalInputValue(roundedFin);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    const res = await fetch("/api/admin/reglages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debut, fin }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }
    setSuccess(true);
    fetchSettings();
  }

  function formatDate(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-sm text-gray-900">Reglages du jeu</span>
        <svg viewBox="0 0 24 24" fill="none" className={"w-4 h-4 text-gray-500 transition-transform duration-300 " + (open ? "rotate-180" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={"grid transition-all duration-300 ease-in-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-4">
            {loaded && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Programmation actuelle</p>
                <p>Debut : {formatDate(current.dateHeureDebut) || "non defini"}</p>
                <p>Fin : {formatDate(current.dateHeureFin) || "non defini"}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date et heure de debut</label>
                <input type="datetime-local" value={debut} min={minDebut} step={600} onChange={(e) => setDebut(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date et heure de fin</label>
                <input type="datetime-local" value={fin} min={minFin} step={600} onChange={(e) => setFin(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
              </div>
              <p className="text-gray-400 text-xs">La fin doit etre au moins 30 minutes apres le debut.</p>

              {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-green-600 text-xs bg-green-50 rounded-lg px-3 py-2">Programmation enregistree</p>}

              <button type="submit" disabled={loading} className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40">
                {loading ? "Enregistrement..." : "Programmer le jeu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
