import { redirect } from "next/navigation";
import { getAdminSession } from "@/app/lib/admin-session";
import AdminLogoutButton from "./AdminLogoutButton";
import CandidatsSection from "./CandidatsSection";
import ClassementSection from "./ClassementSection";
import MessageSection from "./MessageSection";
import ResetSection from "./ResetSection";
import GameSettingsSection from "./GameSettingsSection";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/connexion");

  const initiale = session.prenom.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      <AdminLogoutButton />

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-blue-400 animate-pulse" />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 bg-slate-400 animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 px-4 py-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
            {initiale}
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Espace administrateur 🛡️
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">
              Salut {session.prenom} {session.nom} !
            </h1>
          </div>
        </div>

        <div className="space-y-3">
          <CandidatsSection />
          <ClassementSection />
          <MessageSection />
          <ResetSection />
          <GameSettingsSection />
        </div>
      </div>
    </div>
  );
}

