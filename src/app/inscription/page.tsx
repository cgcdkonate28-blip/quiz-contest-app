"use client";

import { useState, useEffect } from "react";
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

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-white/60 mb-1 ml-1">
      {text}
      {required && <span className="text-red-400 ml-0.5">*</span>}
      {!required && (
        <span className="text-white/30 ml-1">(facultatif)</span>
      )}
    </label>
  );
}

function InputField({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="text-left">
      <Label text={label} required={required} />
      <input
        {...props}
        required={required}
        className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  name,
  valid,
  showBar,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  valid: boolean;
  showBar: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="text-left">
      <Label text={label} required />
      <div className="relative">
        <input
          name={name}
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
      {showBar && (
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

export default function InscriptionPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    username: "",
    email: "",
    password: "",
    confirmationPassword: "",
    tiktokHandle: "",
  });
  const [error, setError] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [loading, setLoading] = useState(false);

  const activeIndex = useSlideshow(images.length, 5000);

  const passwordValid =
    form.password.length >= 4 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password);

  const passwordsMatch =
    form.confirmationPassword.length > 0 &&
    form.confirmationPassword === form.password;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      setUniqueCode(data.uniqueCode);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center py-8 px-3 sm:px-4">
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
          className="text-white/60 text-sm mb-4 hover:text-white transition"
        >
          ← Retour à l&apos;accueil
        </Link>

        {uniqueCode ? (
          <div className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-6 rounded-2xl text-center shadow-2xl">
            <h1 className="text-xl font-bold text-white mb-2">
              Compte créé 🎉
            </h1>
            <p className="text-white/70 text-sm mb-4">
              Voici ton identifiant unique de connexion, composé de la
              première lettre de ton nom suivie de deux chiffres.
            </p>
            <div className="bg-white text-black text-2xl font-bold tracking-widest rounded-xl py-4 mb-4">
              {uniqueCode}
            </div>
            <div className="bg-amber-400/10 border border-amber-400/25 rounded-xl px-4 py-3 mb-5 text-left">
              <p className="text-amber-200 text-xs leading-relaxed">
                ⚠️ Note bien cet identifiant et ton mot de passe — tu en
                auras besoin à chaque connexion, et on ne pourra pas te les
                redonner en cas d&apos;oubli. Une petite capture
                d&apos;écran de cette page peut t&apos;éviter bien des
                soucis 📸
              </p>
            </div>
            <Link
              href="/connexion"
              className="block w-full bg-white text-black rounded-lg py-3 text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Aller à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-sm w-full bg-white/10 backdrop-blur-xl border border-white/15 p-5 sm:p-6 rounded-2xl space-y-3 shadow-2xl"
          >
            <div className="text-center mb-1">
              <h1 className="text-xl font-bold text-white mb-1">
                Crée ton compte
              </h1>
              <p className="text-white/50 text-xs">
                Rejoins le concours en quelques secondes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <InputField
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
              />
              <InputField
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </div>

            <InputField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <PasswordField
              label="Mot de passe (min. 4 car., 1 majuscule, 1 minuscule, 1 chiffre)"
              name="password"
              value={form.password}
              onChange={handleChange}
              valid={passwordValid}
              showBar={form.password.length > 0}
            />

            <PasswordField
              label="Confirme ton mot de passe"
              name="confirmationPassword"
              value={form.confirmationPassword}
              onChange={handleChange}
              valid={passwordsMatch}
              showBar={form.confirmationPassword.length > 0}
            />

            <InputField
              label="Compte TikTok"
              name="tiktokHandle"
              placeholder="@tonpseudo"
              value={form.tiktokHandle}
              onChange={handleChange}
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
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>

            <p className="text-center text-white/40 text-xs">
              Déjà inscrit ?{" "}
              <Link href="/connexion" className="text-white hover:underline">
                Connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

