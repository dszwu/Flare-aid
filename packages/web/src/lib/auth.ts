import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db, ensureDb } from "@/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "flare-aid-dev-secret-change-me"
);

const COOKIE_NAME = "flareaid_admin_token";

export interface AdminSession {
  id: number;
  email: string;
  role: string;
}

export async function signToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminSession | null> {
  console.log("[AUTH] authenticateAdmin called for:", email);
  await ensureDb();
  const result = await db.query(
    "SELECT id, email, password_hash, role FROM admins WHERE email = $1",
    [email]
  );
  const admin = result.rows[0] as { id: number; email: string; password_hash: string; role: string } | undefined;

  if (!admin) {
    console.warn("[AUTH] No admin found with email:", email);
    return null;
  }
  console.log("[AUTH] Admin found, verifying password...");

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    console.warn("[AUTH] Invalid password for:", email);
    return null;
  }

  console.log("[AUTH] Authentication successful for:", email);
  return { id: admin.id, email: admin.email, role: admin.role };
}

export { COOKIE_NAME };
