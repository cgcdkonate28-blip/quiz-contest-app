import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  code: string,
  prenom: string
) {
  await resend.emails.send({
    from: "onboarding@resend.dev", // à remplacer par un domaine vérifié plus tard
    to,
    subject: "Confirme ton inscription au concours",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Salut ${prenom} 👋</h2>
        <p>Voici ton code de confirmation pour valider ton inscription au concours :</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; background: #f4f4f4; padding: 16px; border-radius: 8px;">
          ${code}
        </p>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si tu n'es pas à l'origine de cette inscription, ignore simplement cet email.</p>
      </div>
    `,
  });
}
