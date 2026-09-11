"use client";

import { useEffect, useState } from "react";

export default function LiveMessage({ initialMessage }: { initialMessage: string | null }) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/message")
        .then((r) => r.json())
        .then((d) => setMessage(d.message))
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  if (!message) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
      <p className="text-amber-800 text-sm">Message : {message}</p>
    </div>
  );
}
