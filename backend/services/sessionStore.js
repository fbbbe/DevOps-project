// Simple in-memory session store so the mobile client can hold a bearer token.
// In production this should be replaced with Redis or a proper JWT strategy,
// but for the current app we just need a lightweight solution.

import crypto from "crypto";

const sessions = new Map();

function toPlainUser(user) {
  return {
    user_id: user.user_id ?? user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    status: user.status,
    issuedAt: Date.now(),
  };
}

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(segment) {
  if (!segment) return null;
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(segment.length / 4) * 4,
    "="
  );
  try {
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function issueTokenForUser(user) {
  const plain = toPlainUser(user);
  const payload = base64UrlEncode(plain);
  const random = crypto.randomBytes(16).toString("hex");
  const token = `${payload}.${random}`;
  sessions.set(token, plain);
  return token;
}

export function getUserForToken(token) {
  if (!token) return null;
  const cached = sessions.get(token);
  if (cached) return cached;

  const [payload] = token.split(".");
  const decoded = base64UrlDecode(payload);
  if (decoded && decoded.user_id) {
    sessions.set(token, decoded);
    return decoded;
  }
  return null;
}

export function revokeToken(token) {
  if (!token) return;
  sessions.delete(token);
}
