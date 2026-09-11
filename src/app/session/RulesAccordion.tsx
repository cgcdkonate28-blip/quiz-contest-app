"use client";

import { useState } from "react";

export default function RulesAccordion({ hue = 260 }: { hue?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-bold text-sm text-gray-900">
          📋 Règles du jeu
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="mx-5 mb-5 rounded-xl p-4 text-sm space-y-2 text-gray-700 font-medium"
            style={{ backgroundColor: `hsl(${hue},70%,95%)` }}
          >
            <p>• 10 questions à choix multiples (A/B/C/D).</p>
            <p>• Chaque bonne réponse vaut 10 points, soit 100 points au total.</p>
            <p>• Chaque question dure 60 secondes.</p>
            <p>• Réponds le plus vite possible : ton temps compte.</p>
            <p>• Une seule participation par compte.</p>
            <p>
              • Si tu quittes une question sans répondre, elle compte pour 0
              point et tu reprendras directement à la question suivante — pas
              de retour en arrière possible.
            </p>
            <p>
              • Le jeu se déroule pendant une fenêtre de temps fixée par
              l&apos;administrateur — passé ce délai, tes réponses ne seront
              plus comptabilisées.
            </p>
            <p>• Le classement final sera publié après la fermeture du jeu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

