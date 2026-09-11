"use client";

import { useEffect, useState } from "react";

const phrases = [
  "On croit en toi 💪",
  "Prépare-toi à tout donner 🔥",
  "Le classement t'attend 🏆",
  "Reste connecté, ça va bouger 👀",
  "Ta place est à prendre 🚀",
];

function useTypewriter(words: string[], speed = 60, pause = 1800) {
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

export default function WelcomeTypewriter() {
  const typed = useTypewriter(phrases);

  return (
    <p className="text-gray-600 text-sm md:text-base font-medium min-h-[1.5rem] flex items-center gap-0.5">
      {typed}
      <span className="inline-block w-[2px] h-[1em] bg-gray-400 animate-pulse" />
    </p>
  );
}

