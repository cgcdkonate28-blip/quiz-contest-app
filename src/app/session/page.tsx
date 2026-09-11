import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import CountdownBanner from "./CountdownBanner";
import RulesAccordion from "./RulesAccordion";
import LogoutButton from "./LogoutButton";
import WelcomeTypewriter from "./WelcomeTypewriter";
import LiveMessage from "./LiveMessage";
import ClassementCandidat from "./ClassementCandidat";

export default async function SessionPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) redirect("/connexion");

  const gameSettings = await prisma.gameSettings.findFirst();
  const adminMessage = await prisma.adminMessage.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 100 + Math.floor(Math.random() * 60)) % 360;
  const initiale = user.prenom.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      <LogoutButton />

      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ backgroundColor: `hsl(${hue1}, 85%, 65%)` }}
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{
          backgroundColor: `hsl(${hue2}, 85%, 65%)`,
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          backgroundColor: `hsl(${(hue1 + hue2) / 2}, 85%, 70%)`,
          animationDelay: "2s",
        }}
      />

      <div className="relative z-10 px-4 py-10 max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, hsl(${hue1},80%,60%), hsl(${hue2},80%,60%))`,
            }}
          >
            {initiale}
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Bienvenue ✨
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">
              Salut {user.prenom} !
            </h1>
            <p className="text-gray-400 text-xs">@{user.username}</p>
          </div>
        </div>

        <div className="mb-6">
          <WelcomeTypewriter />
        </div>

        <LiveMessage initialMessage={adminMessage?.texte || null} />
        <ClassementCandidat />

        <div className="space-y-4">
          <CountdownBanner
            startDate={
              gameSettings?.dateHeureDebut
                ? gameSettings.dateHeureDebut.toISOString()
                : null
            }
            hue1={hue1}
            hue2={hue2}
          />
          <RulesAccordion hue={hue1} />
        </div>
      </div>
    </div>
  );
}

