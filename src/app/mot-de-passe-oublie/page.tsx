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

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="text-left">
      <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  valid,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  valid: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="text-left">
      <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {value.length > 0 && (
        <div className="h-1 rounded-full mt-1.5 overflow-hidden bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              valid ? "bg-green-400 w-full" : "bg-red-400 w-1/3"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const activeIndex = useSlideshow(images.length, 5000);

  const [step, setStep] = useState<"form" | "confirm" | "newPassword" | "done">(
    "form"
  );
  const [identInfo, setIdentInfo] = useState({
    uniqueCode: "",
    nom: "",
    prenom: "",
    username: "",
    email: "",
  });
  const [matchedUser, setMatchedUser] = useState<{
    userId: string;
    prenom: string;
    nom: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid =
    password.length >= 4 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
  const passwordsMatch =
    confirmationPassword.length > 0 && confirmationPassword === password;

  async function handleVerifier(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mot-de-passe-oublie/verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identInfo),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }
      setMatchedUser(data);
      setStep("confirm");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleReinitialiser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mot-de-passe-oublie/reinitialiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: matchedUser?.userId,
          password,
          confirmationPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }
      setStep("done");
      setTimeout(() => router.push("/connexion"), 2000);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
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
          href="/connexion"
          className="text-white/60 text-sm mb-6 hover:text-white transition"
        >
          ← Retour à la connexion
        </Link>

        {step === "form" && (
          <form
            onSubmit={handleVerifier}
            className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl space-y-3 shadow-2xl"
          >
            <div className="text-center mb-1">
              <h1 className="text-xl font-bold text-white mb-1">
                Mot de passe oublié
              </h1>
              <p className="text-white/50 text-xs">
                Renseigne tes informations d&apos;inscription
              </p>
            </div>

            <InputField
              label="Identifiant"
              placeholder="Ex: K89"
              value={identInfo.uniqueCode}
              onChange={(e) =>
                setIdentInfo({ ...identInfo, uniqueCode: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2.5">
              <InputField
                label="Nom"
                value={identInfo.nom}
                onChange={(e) =>
                  setIdentInfo({ ...identInfo, nom: e.target.value })
                }
              />
              <InputField
                label="Prénom"
                value={identInfo.prenom}
                onChange={(e) =>
                  setIdentInfo({ ...identInfo, prenom: e.target.value })
                }
              />
            </div>
            <InputField
              label="Username"
              value={identInfo.username}
              onChange={(e) =>
                setIdentInfo({ ...identInfo, username: e.target.value })
              }
            />
            <InputField
              label="Email"
              type="email"
              value={identInfo.email}
              onChange={(e) =>
                setIdentInfo({ ...identInfo, email: e.target.value })
              }
            />

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
              {loading ? "Recherche..." : "Valider"}
            </button>
          </form>
        )}

        {step === "confirm" && matchedUser && (
          <div className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl text-center shadow-2xl space-y-4">
            <h1 className="text-xl font-bold text-white">
              Es-tu bien {matchedUser.prenom} {matchedUser.nom} ? 🤔
            </h1>
            <p className="text-white/60 text-sm">
              Confirme ton identité pour continuer et choisir un nouveau mot
              de passe.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("newPassword")}
                className="flex-1 bg-white text-black rounded-lg py-3 text-sm font-semibold hover:scale-[1.02] transition-transform"
              >
                Oui, c&apos;est moi
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setMatchedUser(null);
                }}
                className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg py-3 text-sm font-semibold hover:bg-white/20 transition"
              >
                Non
              </button>
            </div>
          </div>
        )}

        {step === "newPassword" && (
          <form
            onSubmit={handleReinitialiser}
            className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl space-y-3 shadow-2xl"
          >
            <div className="text-center mb-1">
              <h1 className="text-xl font-bold text-white mb-1">
                Nouveau mot de passe
              </h1>
              <p className="text-white/50 text-xs">
                Min. 4 caractères, 1 majuscule, 1 minuscule, 1 chiffre
              </p>
            </div>

            <PasswordField
              label="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              valid={passwordValid}
            />
            <PasswordField
              label="Confirme le mot de passe"
              value={confirmationPassword}
              onChange={(e) => setConfirmationPassword(e.target.value)}
              valid={passwordsMatch}
            />

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
              {loading ? "Mise à jour..." : "Valider le nouveau mot de passe"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl text-center shadow-2xl">
            <h1 className="text-xl font-bold text-white mb-2">
              Mot de passe mis à jour ✅
            </h1>
            <p className="text-white/60 text-sm">
              Redirection vers la connexion...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

