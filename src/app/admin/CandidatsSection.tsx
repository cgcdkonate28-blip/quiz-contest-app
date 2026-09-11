"use client";

import { useEffect, useState } from "react";

type Candidat = {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  tiktokHandle: string;
  createdAt: string;
};

type Reponse = {
  question: string;
  reponseDonnee: string | null;
  bonneReponse: string;
  pointsObtenus: number;
};

type Details = {
  hasAttempt: boolean;
  scoreTotal?: number | null;
  tempsTotal?: number | null;
  reponses?: Reponse[];
};

export default function CandidatsSection() {
  const [open, setOpen] = useState(false);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Details>>({});

  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/admin/candidats").then((r) => r.json()).then((d) => {
        setCandidats(d.candidats || []);
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  function tiktokUrl(handle: string) {
    const clean = handle.replace(/^@/, "");
    return "https://www.tiktok.com/@" + clean;
  }

  function toggleCandidat(id: string) {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen && !details[id]) {
      fetch("/api/admin/candidats/" + id).then((r) => r.json()).then((d) => {
        setDetails(function (prev) {
          const next = Object.assign({}, prev);
          next[id] = d;
          return next;
        });
      });
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-sm text-gray-900">Candidats {loaded ? "(" + candidats.length + ")" : ""}</span>
        <svg viewBox="0 0 24 24" fill="none" className={"w-4 h-4 text-gray-500 transition-transform duration-300 " + (open ? "rotate-180" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={"grid transition-all duration-300 ease-in-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-2">
            {!loaded && <p className="text-gray-400 text-sm">Chargement...</p>}
            {loaded && candidats.length === 0 && <p className="text-gray-400 text-sm">Aucun candidat inscrit pour l'instant.</p>}
            {candidats.map(function (c) {
              const isOpen = openId === c.id;
              const d = details[c.id];
              return (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => toggleCandidat(c.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <span className="text-sm font-medium text-gray-800">@{c.username}</span>
                    <svg viewBox="0 0 24 24" fill="none" className={"w-3.5 h-3.5 text-gray-400 transition-transform duration-300 " + (isOpen ? "rotate-180" : "")}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 text-sm text-gray-600 space-y-1.5 border-t border-gray-100">
                        <p><span className="text-gray-400">Nom : </span>{c.nom}</p>
                        <p><span className="text-gray-400">Prenom : </span>{c.prenom}</p>
                        <p><span className="text-gray-400">Email : </span>{c.email}</p>
                        <p><span className="text-gray-400">Inscrit le : </span>{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                        {c.tiktokHandle && (
                          <p><span className="text-gray-400">TikTok : </span><a href={tiktokUrl(c.tiktokHandle)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">{c.tiktokHandle}</a></p>
                        )}
                        {!c.tiktokHandle && (
                          <p><span className="text-gray-400">TikTok : </span><span className="italic text-gray-400">non renseigne</span></p>
                        )}

                        <div className="pt-2">
                          {!d && <p className="text-gray-400 text-xs">Chargement du detail...</p>}
                          {d && !d.hasAttempt && <p className="text-gray-400 text-xs italic">Ce candidat n'a pas encore joue.</p>}
                          {d && d.hasAttempt && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="text-left px-2 py-1.5 border border-gray-200">Question</th>
                                    <th className="text-left px-2 py-1.5 border border-gray-200">Reponse</th>
                                    <th className="text-left px-2 py-1.5 border border-gray-200">Bonne reponse</th>
                                    <th className="text-left px-2 py-1.5 border border-gray-200">Points</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(d.reponses || []).map(function (r, idx) {
                                    return (
                                      <tr key={idx}>
                                        <td className="px-2 py-1.5 border border-gray-200">{r.question}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{r.reponseDonnee || "-"}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{r.bonneReponse}</td>
                                        <td className="px-2 py-1.5 border border-gray-200">{r.pointsObtenus}</td>
                                      </tr>
                                    );
                                  })}
                                  <tr className="bg-gray-50 font-semibold">
                                    <td className="px-2 py-1.5 border border-gray-200" colSpan={3}>Total</td>
                                    <td className="px-2 py-1.5 border border-gray-200">{d.scoreTotal}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

