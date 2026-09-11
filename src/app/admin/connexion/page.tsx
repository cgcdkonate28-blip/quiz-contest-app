"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const images = [
  "/concours/photo1.jpg",
  "/concours/photo2.jpg",
  "/concours/photo3.jpg",
  "/concours/photo4.jpg",
  "/concours/photo5.jpg",
];

function useSlideshow(length: number, interval = 5000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [length, interval]);
  return index;
}

export default function AdminConnexionPage() {
  const router = useRouter();
  const [nomOuPrenom, setNomOuPrenom] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeIndex = useSlideshow(images.length, 5000);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomOuPrenom, adminKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Impossible de contacter le serveur");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center py-10 px-4">
      <div className="absolute inset-0">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover blur-sm scale-105 transition-opacity duration-1000 ease-in-out ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <Link
          href="/"
          className="text-white/60 text-sm mb-6 hover:text-white transition"
        >
          ← Retour à l&apos;accueil
        </Link>

        <form
          onSubmit={handleSubmit}
          className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl space-y-4 shadow-2xl"
        >
          <div className="text-center mb-1">
            <h1 className="text-xl font-bold text-white mb-1">
              🛡️ Connexion administrateur
            </h1>
          </div>

          <div className="text-left">
            <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
              Nom ou prénom
            </label>
            <input
              value={nomOuPrenom}
              onChange={(e) => setNomOuPrenom(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition"
            />
          </div>

          <div className="text-left">
            <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
              Clé administrateur
            </label>
            <input
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Ex: M4DX"
              required
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition uppercase"
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
            className="w-full bg-white text-black rounded-lg py-3 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

