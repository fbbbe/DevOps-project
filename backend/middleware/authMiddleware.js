import { getUserForToken } from "../services/sessionStore.js";

export function attachUserFromToken(req, _res, next) {
  try {
    const header = req.get("Authorization") || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : header.trim();

    if (!token) {
      return next();
    }

    const sessionUser = getUserForToken(token);
    if (!sessionUser) {
      return next();
    }

    req.user = {
      id: sessionUser.user_id,
      email: sessionUser.email,
      nickname: sessionUser.nickname,
      role: sessionUser.role,
      status: sessionUser.status,
    };
  } catch (err) {
    console.warn("attachUserFromToken error:", err);
  }
  return next();
}
