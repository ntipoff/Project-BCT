export type SessionPayload = { memberId: string };

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padLength = (4 - (str.length % 4)) % 4;
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  payload: SessionPayload,
  secret: string
): Promise<string> {
  const data = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer);
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;

  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const key = await getKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(sig),
    new TextEncoder().encode(data)
  );
  if (!valid) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(data)));
    if (typeof parsed?.memberId !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
