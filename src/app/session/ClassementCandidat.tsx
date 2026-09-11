"use client";

import { useEffect, useState } from "react";

type Top3Entry = {
  rang: number;
  username: string;
  score: number | null;
};

type Resultat = {
  publies: boolean;
  top3?: Top3Entry[];
  monRang?: number | null;
  monScore?: number | null;
  aJoue?: boolean;
};

const medailles: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function ClassementCandidat() {
  const [resultat, setResultat] = useState<Resultat | null>(null);

  function fetchResultat() {
    fetch("/api/jeu/resultat").then((r) => r.json()).then((d) => setResultat(d));
  }

  useEffect(() => {
    fetchResultat();
    const interval = setInterval(fetchResultat, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!resultat || !resultat.publies) return null;

  const top3 = resultat.top3 || [];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-5 mb-4 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-600 text-center">Resultats du concours</p>

      <div className="space-y-2">
        {top3.map(function (entry) {
          return (
            <div key={entry.rang} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{medailles[entry.rang] || entry.rang}</span>
                <span className="text-sm font-medium text-gray-700">@{entry.username}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{entry.score} pts</span>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2 border-t border-amber-200">
        {resultat.aJoue ? (
          <p className="text-sm text-gray-800">
            Vous avez termine <span className="font-bold">{resultat.monRang}e</span> avec <span className="font-bold">{resultat.monScore} points</span> !
          </p>
        ) : (
          <p className="text-sm text-gray-500">Tu n'as pas participe a ce concours.</p>
        )}
      </div>
    </div>
  );
}
