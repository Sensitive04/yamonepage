import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "yamone_admin";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const TOKEN_TTL_MS = TOKEN_TTL_SECONDS * 1000;

function hmac(value: string, secret: string): string {
  return createHmac("sha256", `yamone:${secret}`).update(value).digest("hex");
}

export function signAdminToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;

  const expiresAt = Date.now() + TOKEN_TTL_MS;
  return `${expiresAt}.${hmac(String(expiresAt), secret)}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;

  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = Buffer.from(hmac(expiresRaw, secret), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export function checkPassword(candidate: string): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const a = Buffer.from(createHmac("sha256", "yamone:password").update(candidate).digest());
  const b = Buffer.from(createHmac("sha256", "yamone:password").update(secret).digest());
  return timingSafeEqual(a, b);
}

export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return verifyAdminToken(match?.[1]);
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TOKEN_TTL_SECONDS,
};
