import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Role } from "@/generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const TOKEN_NAME = "choir_token";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
  memberId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { member: { include: { section: true } } },
  });
  if (!user || !user.isActive) return null;
  return user;
}

export function setTokenCookie(token: string) {
  return {
    "Set-Cookie": `${TOKEN_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  };
}

export function clearTokenCookie() {
  return {
    "Set-Cookie": `${TOKEN_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  };
}

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  CHOIR_DIRECTOR: 80,
  SECRETARY: 60,
  TREASURER: 60,
  SECTION_LEADER: 40,
  MEMBER: 20,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canManageMembers(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY"].includes(role);
}

export function canManageAttendance(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "SECTION_LEADER"].includes(role);
}

export function canManagePayments(role: Role): boolean {
  return ["SUPER_ADMIN", "TREASURER"].includes(role);
}

export function canManagePenalties(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR"].includes(role);
}

export function canManageEvents(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY"].includes(role);
}

export function canManageAnnouncements(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY"].includes(role);
}

export function canManageSettings(role: Role): boolean {
  return ["SUPER_ADMIN"].includes(role);
}

export function canManageUsers(role: Role): boolean {
  return ["SUPER_ADMIN"].includes(role);
}

export function canViewReports(role: Role): boolean {
  return ["SUPER_ADMIN", "CHOIR_DIRECTOR", "SECRETARY", "TREASURER"].includes(role);
}

export function canViewFinancialReports(role: Role): boolean {
  return ["SUPER_ADMIN", "TREASURER"].includes(role);
}
