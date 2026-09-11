"use client";

import { useEffect, useState } from "react";

type Candidat = {
  id: string;
  username: string;
};

export default function ResetSection() {
  const [open, setOpen] = useState(false);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function fetchCandidats() {
    fetch("/api/admin/candidats").then((r) => r.json()).then((d) => {
      setCandidats(d.candidats || []);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (open && !loaded) fetchCandidats();
  }, [open, loaded]);

  async function handleReset(id: string, username: string) {
    if (!confirm("Reinitialiser la tentative de @" + username + " ? Il pourra rejouer.")) return;
    setResetting(id);
    await fetch("/api/admin/candidats/" + id + "/reset", { method: "POST" });
    setResetting(null);
    setDone(username);
    setTimeout(() => setDone(null), 3000);
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-sm text-gray-900">Reinitialiser un candidat {loaded ? "(" + candidats.length + ")" : ""}</span>
        <svg viewBox="0 0 24 24" fill="none" className={"w-4 h-4 text-gray-500 transition-transform duration-300 " + (open ? "rotate-180" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={"grid transition-all duration-300 ease-in-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-2">
            {!loaded && <p className="text-gray-400 text-sm">Chargement...</p>}
            {loaded && candidats.length === 0 && <p className="text-gray-400 text-sm">Aucun candidat inscrit.</p>}
            {done && <p className="text-green-600 text-xs bg-green-50 rounded-lg px-3 py-2">@{done} peut rejouer.</p>}
            {candidats.map(function (c) {
              return (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">@{c.username}</span>
                  <button
                    onClick={() => handleReset(c.id, c.username)}
                    disabled={resetting === c.id}
                    className="text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg px-3 py-1.5 disabled:opacity-40"
                  >
                    {resetting === c.id ? "..." : "Reinitialiser"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
