"use client";

import { useState } from "react";

export default function TechnicienPage() {
  const [step, setStep] = useState<"secret" | "form">("secret");
  const [secret, setSecret] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/technicien/verifier-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Mot de passe incorrect");
        setLoading(false);
        return;
      }

      setStep("form");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdminKey("");
    setLoading(true);

    try {
      const res = await fetch("/api/technicien/creer-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, nom, prenom }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        if (res.status === 401) {
          setStep("secret");
          setSecret("");
        }
        setLoading(false);
        return;
      }

      setAdminKey(data.adminKey);
      setNom("");
      setPrenom("");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-4">
        <h1 className="text-lg font-bold text-white">🔧 Espace technicien</h1>

        {step === "secret" && (
          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Mot de passe secret
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gray-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Déverrouiller"}
            </button>
          </form>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-gray-500 mb-1">
              Créer un nouveau compte admin
            </p>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Prénom
              </label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gray-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer l'admin"}
            </button>

            {adminKey && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <p className="text-green-400 text-xs mb-1">Clé générée :</p>
                <p className="text-white text-2xl font-bold tracking-widest">
                  {adminKey}
                </p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

