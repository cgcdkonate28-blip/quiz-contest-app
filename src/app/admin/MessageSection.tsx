"use client";

import { useState } from "react";

export default function MessageSection() {
  const [texte, setTexte] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEnvoyer() {
    if (!texte.trim()) return;
    setLoading(true);
    setEnvoye(false);
    await fetch("/api/admin/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texte }),
    });
    setLoading(false);
    setEnvoye(true);
    setTexte("");
    setTimeout(() => setEnvoye(false), 3000);
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
      <p className="font-semibold text-sm text-gray-900">Passer un message aux candidats</p>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Ecris ton message ici..."
        rows={3}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
      <button
        onClick={handleEnvoyer}
        disabled={loading || !texte.trim()}
        className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>
      {envoye && <p className="text-green-600 text-xs text-center">Message envoye a tous les candidats.</p>}
    </div>
  );
}
