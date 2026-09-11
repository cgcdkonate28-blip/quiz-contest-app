"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  ordre: number;
  texte: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  bonneReponse: string;
  tempsImparti: number;
};

const emptyForm = {
  ordre: 1,
  texte: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  bonneReponse: "A",
  tempsImparti: 60,
};

export default function QuestionsSection() {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fetchQuestions() {
    fetch("/api/admin/questions").then((r) => r.json()).then((d) => {
      setQuestions(d.questions || []);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (open && !loaded) fetchQuestions();
  }, [open, loaded]);

  function startEdit(q: Question) {
    setEditingId(q.id);
    setForm({
      ordre: q.ordre,
      texte: q.texte,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      bonneReponse: q.bonneReponse,
      tempsImparti: q.tempsImparti,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm, ordre: questions.length + 1 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = editingId ? "/api/admin/questions/" + editingId : "/api/admin/questions";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Une erreur est survenue");
      return;
    }
    fetchQuestions();
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    await fetch("/api/admin/questions/" + id, { method: "DELETE" });
    fetchQuestions();
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-sm text-gray-900">Questions {loaded ? "(" + questions.length + ")" : ""}</span>
        <svg viewBox="0 0 24 24" fill="none" className={"w-4 h-4 text-gray-500 transition-transform duration-300 " + (open ? "rotate-180" : "")}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={"grid transition-all duration-300 ease-in-out " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-3">
            {!loaded && <p className="text-gray-400 text-sm">Chargement...</p>}
            {loaded && questions.length === 0 && <p className="text-gray-400 text-sm">Aucune question pour l'instant.</p>}

            {questions.sort((a, b) => a.ordre - b.ordre).map(function (q) {
              return (
                <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Question {q.ordre} - {q.tempsImparti}s</p>
                      <p className="font-medium text-sm">{q.texte}</p>
                      <p className="text-xs text-green-600 mt-1">Bonne reponse : {q.bonneReponse}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(q)} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5">Modifier</button>
                      <button onClick={() => handleDelete(q.id)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 rounded-lg px-3 py-1.5">Supprimer</button>
                    </div>
                  </div>
                </div>
              );
            })}

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
              <p className="text-xs font-semibold text-gray-600">{editingId ? "Modifier la question" : "Ajouter une question"}</p>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Temps (secondes)</label>
                  <input type="number" value={form.tempsImparti} onChange={(e) => setForm({ ...form, tempsImparti: Number(e.target.value) })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Question</label>
                <input value={form.texte} onChange={(e) => setForm({ ...form, texte: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Option A</label>
                <input value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Option B</label>
                <input value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Option C</label>
                <input value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Option D</label>
                <input value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400" />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Bonne reponse</label>
                <select value={form.bonneReponse} onChange={(e) => setForm({ ...form, bonneReponse: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40">
                  {loading ? "Enregistrement..." : editingId ? "Mettre a jour" : "Ajouter"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="bg-gray-100 rounded-lg px-4 py-2.5 text-sm">Annuler</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
