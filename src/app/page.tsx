"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const phrases = [
  "Participe au concours.",
  "Réponds au quiz.",
  "Tente ta chance.",
  "Décroche ta place.",
];

function useTypewriter(words: string[], speed = 80, pause = 1500) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];
    let timeout: NodeJS.Timeout;

    if (!deleting && text.length < currentWord.length) {
      timeout = setTimeout(
        () => setText(currentWord.slice(0, text.length + 1)),
        speed
      );
    } else if (!deleting && text.length === currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(
        () => setText(currentWord.slice(0, text.length - 1)),
        speed / 2
      );
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setWordIndex((i) => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, speed, pause]);

  return text;
}

export default function Home() {
  const typed = useTypewriter(phrases);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative z-10 text-center px-4 max-w-xl w-full">
        <p className="uppercase tracking-[0.3em] text-white/60 text-xs mb-4">
          Grand Concours
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 min-h-[3.5rem] md:min-h-[4rem] flex items-center justify-center">
          {typed}
          <span className="inline-block w-[2px] h-[1em] bg-white ml-1 animate-pulse" />
        </h1>
        <p className="text-white/70 mb-10">
          Inscris-toi, joue, et grimpe au classement.
        </p>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Link
            href="/inscription"
            className="w-full bg-white text-black font-semibold rounded-full py-3.5 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Inscription
          </Link>
          <Link
            href="/connexion"
            className="w-full bg-white/10 border border-white/30 text-white font-semibold rounded-full py-3.5 backdrop-blur transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            Connexion
          </Link>
          <Link
            href="/admin/connexion"
            className="text-white/50 text-sm mt-2 hover:text-white transition-colors"
          >
            Connexion administrateur
          </Link>
          <Link
            href="/technicien"
            className="text-white/25 text-xs hover:text-white/50 transition-colors"
          >
            🔧
          </Link>
        </div>
      </div>
    </div>
  );
}

