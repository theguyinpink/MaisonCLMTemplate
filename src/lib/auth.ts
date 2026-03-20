import crypto from "crypto";

const COOKIE_NAME = "admin_session";

export function getCookieName() {
  return COOKIE_NAME;
}

export function signSession(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const hmac = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${hmac}`;
}

export function verifySession(signed: string | undefined | null) {
  if (!signed) return false;
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const parts = signed.split(".");
  if (parts.length !== 2) return false;
  const [value, hmac] = parts;
  const expected = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
}
