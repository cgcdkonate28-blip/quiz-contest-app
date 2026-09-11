import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateUniqueIdCandidate(nom: string): string {
  const lettre = nom.trim().charAt(0).toUpperCase();
  const nombre = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${lettre}${nombre}`;
}
