import crypto from "crypto";

export type EntitlementScope = "all" | "dating" | "party" | "intimacy";
export type EntitlementPayload = {
  email: string;
  scope: EntitlementScope;
  iat: number; // issued at (seconds)
  exp: number; // expires at (seconds)
};

export type RestoreTokenPayload = EntitlementPayload & {
  jti: string; // one-time token id
};

const COOKIE_NAME = "tm_entitlement";
export const ENTITLEMENT_COOKIE = COOKIE_NAME;

function getSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret) throw new Error("Missing APP_SECRET env");
  return secret;
}

export function signEntitlement(payload: EntitlementPayload): string {
  const secret = getSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyEntitlement(token: string | undefined): EntitlementPayload | null {
  if (!token) return null;
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as EntitlementPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function signRestoreToken(payload: RestoreTokenPayload): string {
  return signEntitlement(payload as unknown as EntitlementPayload);
}

export function verifyRestoreToken(token: string | undefined): RestoreTokenPayload | null {
  const base = verifyEntitlement(token) as EntitlementPayload | null;
  if (!base) return null;
  try {
    const body = Buffer.from(String(token).split(".")[0], "base64url").toString("utf8");
    const full = JSON.parse(body) as RestoreTokenPayload;
    if (!full.jti) return null;
    return full;
  } catch {
    return null;
  }
}


