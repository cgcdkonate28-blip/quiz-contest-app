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

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.5 6.7C3.9 8.4 2 12 2 12s4 7 11 7c1.9 0 3.5-.5 4.9-1.2M9.9 4.2C10.6 4.1 11.3 4 12 4c7 0 11 7 11 7-.4.7-1.3 2-2.6 3.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ConnexionPage() {
  const router = useRouter();
  const [uniqueCode, setUniqueCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeIndex = useSlideshow(images.length, 5000);

  useEffect(() => {
    function checkSession() {
      fetch("/api/moi")
        .then((r) => r.json())
        .then((d) => {
          if (d.loggedIn) router.replace("/session");
        });
    }
    checkSession();
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) checkSession();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      router.replace("/session");
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
      <div className="absolute inset-0 bg-black/40" />

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
            <h1 className="text-xl font-bold text-white mb-1">Connexion</h1>
            <p className="text-white/50 text-xs">
              Utilise l&apos;identifiant reçu à l&apos;inscription
            </p>
          </div>

          <div className="text-left">
            <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
              Identifiant
            </label>
            <input
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              placeholder="Ex: K89"
              required
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition uppercase"
            />
          </div>

          <div className="text-left">
            <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
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

          <div className="text-center space-y-1.5">
            <Link
              href="/mot-de-passe-oublie"
              className="block text-white/40 text-xs hover:text-white/70 transition"
            >
              Mot de passe oublié ?
            </Link>
            <p className="text-white/40 text-xs">
              Pas encore inscrit ?{" "}
              <Link href="/inscription" className="text-white hover:underline">
                Inscription
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

