"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const jours = Math.floor(diff / (1000 * 60 * 60 * 24));
  const heures = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const secondes = Math.floor((diff / 1000) % 60);
  return { jours, heures, minutes, secondes };
}

export default function CountdownBanner({ startDate, hue1 = 260, hue2 = 320 }: { startDate: string | null; hue1?: number; hue2?: number }) {
  const [currentStartDate, setCurrentStartDate] = useState(startDate);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    if (!currentStartDate) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(currentStartDate);
    setTimeLeft(getTimeLeft(target));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStartDate]);

  useEffect(() => {
    const poll = setInterval(() => {
      fetch("/api/admin/reglages")
        .then((r) => r.json())
        .then((d) => {
          setCurrentStartDate(d.dateHeureDebut || null);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  if (!currentStartDate) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100">
        <div className="text-4xl mb-2">⏳</div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Statut du concours</p>
        <p className="text-gray-800 text-sm font-medium">Le jeu n&apos;a pas encore ete programme.<br />Reviens bientot ! 👀</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-green-400">
        <p className="text-gray-900 text-lg font-bold mb-3">Le jeu est lance !</p>
        <a href="/jeu" className="inline-block bg-black text-white rounded-full px-8 py-3 text-sm font-semibold hover:scale-105 transition-transform">Jouer 🔥</a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100">
      <p className="text-2xl mb-2">🚀</p>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Le jeu commence dans</p>
      <div className="flex justify-center gap-2.5">
        {[
          { label: "jours", value: timeLeft.jours },
          { label: "heures", value: timeLeft.heures },
          { label: "min", value: timeLeft.minutes },
          { label: "sec", value: timeLeft.secondes },
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="text-white rounded-xl w-14 py-3 text-xl font-black shadow-md" style={{ background: "linear-gradient(135deg, hsl(" + hue1 + ",70%,50%), hsl(" + hue2 + ",70%,50%))" }}>
              {String(unit.value).padStart(2, "0")}
            </div>
            <span className="text-gray-500 text-[10px] font-semibold mt-1.5 uppercase tracking-wide">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
