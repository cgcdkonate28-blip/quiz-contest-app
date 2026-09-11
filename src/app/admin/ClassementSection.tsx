"use client";

import { useEffect, useState } from "react";

type Ligne = {
  rang: number;
  username: string;
  score: number | null;
  temps: number | null;
};

export default function ClassementSection() {
  const [open, setOpen] = useState(false);
  const [classement, setClassement] = useState<Ligne[]>([]);
  const [resultatsPublies, setResultatsPublies] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  function fetchClassement() {
    fetch("/api/admin/classement").then((r) => r.json()).then((d) => {
      setClassement(d.classement || []);
      setResultatsPublies(d.resultatsPublies || false);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (open && !loaded) {
      fetchClassement();
    }
  }, [open, loaded]);

  async function handlePublier() {
    if (!confirm("Publier le classement ? Chaque candidat verra son resultat.")) return;
    setPublishing(true);
    await fetch("/api/admin/publier-resultats", { method: "POST" });
    setPublishing(false);
    fetchClassement();
  }

  async function handleRetirer() {
    if (!confirm("Retirer le classement ? Les candidats ne le verront plus.")) return;
    setUnpublishing(true);
    await fetch("/api/admin/retirer-resultats", { method: "POST" });
    setUnpublishing(false);
    fetchClassement();
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-sm text-gray-900">Classement {loaded ? "(" + classement.length + ")" : ""}</span>
        <svg viewBox="0 0 24 24" fill="none" className={"w-4 h-4 text-gray-500 transition-transform duration-300 " + (open ? "rotate-180" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={"grid transition-all duration-300 ease-in-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-3">
            {!loaded && <p className="text-gray-400 text-sm">Chargement...</p>}
            {loaded && classement.length === 0 && <p className="text-gray-400 text-sm">Aucun resultat pour l'instant.</p>}

            {loaded && (
              <p className="text-xs font-medium">
                Statut : {resultatsPublies ? <span className="text-green-600">Publie</span> : <span className="text-gray-400">Non publie</span>}
              </p>
            )}

            {loaded && classement.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse bg-white rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-2 py-1.5 border border-gray-200">Rang</th>
                      <th className="text-left px-2 py-1.5 border border-gray-200">Candidat</th>
                      <th className="text-left px-2 py-1.5 border border-gray-200">Points</th>
                      <th className="text-left px-2 py-1.5 border border-gray-200">Temps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classement.map(function (l) {
                      return (
                        <tr key={l.rang}>
                          <td className="px-2 py-1.5 border border-gray-200">{l.rang}</td>
                          <td className="px-2 py-1.5 border border-gray-200">@{l.username}</td>
                          <td className="px-2 py-1.5 border border-gray-200">{l.score}</td>
                          <td className="px-2 py-1.5 border border-gray-200">{l.temps}s</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {loaded && (
              <div className="flex gap-2">
                <button
                  onClick={handlePublier}
                  disabled={publishing}
                  className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  {publishing ? "Publication..." : "PUBLIER"}
                </button>
                <button
                  onClick={handleRetirer}
                  disabled={unpublishing || !resultatsPublies}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  {unpublishing ? "Retrait..." : "RETIRER"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
