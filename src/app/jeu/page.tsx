"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type QuestionData = {
  id: string;
  texte: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

type EtatJeu = {
  ouvert: boolean;
  ferme?: boolean;
  termine?: boolean;
  scoreTotal?: number;
  numero?: number;
  total?: number;
  tempsImparti?: number;
  question?: QuestionData;
};

const optionColors: Record<string, string> = {
  A: "hsl(0, 80%, 60%)",
  B: "hsl(210, 80%, 55%)",
  C: "hsl(140, 65%, 45%)",
  D: "hsl(45, 90%, 55%)",
};

export default function JeuPage() {
  const router = useRouter();
  const [etat, setEtat] = useState<EtatJeu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  const selectedRef = useRef<"A" | "B" | "C" | "D" | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const advancedRef = useRef(false);
  const fetchingRef = useRef(false);
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const fetchQuestion = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await fetch("/api/jeu/question");
      if (res.status === 401) {
        router.replace("/connexion");
        return;
      }
      const data: EtatJeu = await res.json();
      setEtat(data);
      setSelected(null);
      advancedRef.current = false;
      startedAtRef.current = Date.now();
      setTimeLeft(data.tempsImparti || 60);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    if (hasFetchedOnce.current) return;
    hasFetchedOnce.current = true;
    fetchQuestion();
  }, [fetchQuestion]);

  const goNext = useCallback(
    async (reponse: "A" | "B" | "C" | "D" | null, questionId: string) => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      setSubmitting(true);
      const tempsPris = Math.min(60, Math.round((Date.now() - startedAtRef.current) / 1000));
      await fetch("/api/jeu/repondre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, reponse, tempsPris }),
      });
      setSubmitting(false);
      await fetchQuestion();
    },
    [fetchQuestion]
  );

  const questionId = etat?.question?.id || null;

  useEffect(() => {
    if (!etat || !etat.ouvert || etat.termine || !questionId) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          goNext(selectedRef.current, questionId);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [questionId, etat, goNext]);

  function handleArrowClick() {
    if (!questionId) return;
    goNext(selected, questionId);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!etat || !etat.ouvert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">⏳</p>
          <p className="text-gray-700 text-sm mb-4">
            {etat && etat.ferme ? "Le jeu est termine." : "Le jeu n'est pas encore ouvert."}
          </p>
          <button onClick={() => router.replace("/session")} className="bg-black text-white rounded-lg px-4 py-2 text-sm font-semibold">
            Retour a ma session
          </button>
        </div>
      </div>
    );
  }

  if (etat.termine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Quiz termine !</h1>
          <p className="text-gray-500 text-sm mb-4">Merci d'avoir participe. Les resultats seront publies bientot.</p>
          <button onClick={() => router.replace("/session")} className="bg-black text-white rounded-lg px-4 py-2 text-sm font-semibold">
            Retour a ma session
          </button>
        </div>
      </div>
    );
  }

  const q = etat.question!;
  const options: Array<{ key: "A" | "B" | "C" | "D"; texte: string }> = [
    { key: "A", texte: q.optionA },
    { key: "B", texte: q.optionB },
    { key: "C", texte: q.optionC },
    { key: "D", texte: q.optionD },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-fuchsia-400 animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-violet-400 animate-pulse" />

      <div className="relative z-10 px-4 py-8 max-w-lg mx-auto min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Question {etat.numero} / {etat.total}
          </span>
          <div className={"flex items-center justify-center w-12 h-12 rounded-full font-bold text-white " + (timeLeft <= 10 ? "bg-red-500 animate-pulse" : "bg-gray-900")}>
            {timeLeft}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-8 leading-snug">{q.texte}</h1>

        <div className="grid gap-3 flex-1">
          {options.map((opt) => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className="w-full text-left px-4 py-4 rounded-2xl border-2 font-medium transition-all duration-200"
                style={{
                  borderColor: isSelected ? optionColors[opt.key] : "#e5e7eb",
                  backgroundColor: isSelected ? optionColors[opt.key] + "22" : "#fafafa",
                  color: isSelected ? optionColors[opt.key] : "#374151",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="font-bold mr-2">{opt.key}.</span>
                {opt.texte}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleArrowClick}
            disabled={submitting}
            aria-label="Question suivante"
            className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-lg disabled:opacity-40 transition-transform hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
