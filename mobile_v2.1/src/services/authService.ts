// src/services/authService.ts

const BASE_URL = "http://192.168.0.34:8181"; // Adjust to match backend host if needed.

export type AuthUserPayload = {
  user_id: number;
  email: string;
  nickname: string;
  role: string;
  status: string;
};

export type AuthResponse = {
  user: AuthUserPayload;
  token?: string;
};

const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt", "bearer"] as const;

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeAuthResponse(raw: any): AuthResponse {
  if (!raw || typeof raw !== "object") {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }

  const token =
    TOKEN_KEYS.map((key) => raw?.[key]).find((value): value is string => typeof value === "string") ??
    undefined;

  const candidate =
    raw.user && typeof raw.user === "object"
      ? raw.user
      : {
          user_id: raw.user_id ?? raw.id,
          email: raw.email,
          nickname: raw.nickname,
          role: raw.role,
          status: raw.status,
        };

  const userId = parseNumber(candidate?.user_id ?? raw.user_id ?? raw.id);
  const email = parseString(candidate?.email ?? raw.email ?? "");

  if (userId === null || email.length === 0) {
    throw new Error("응답에 사용자 정보가 없습니다.");
  }

  const user: AuthUserPayload = {
    user_id: userId,
    email,
    nickname: parseString(candidate?.nickname ?? raw.nickname ?? email),
    role: parseString(candidate?.role ?? raw.role ?? ""),
    status: parseString(candidate?.status ?? raw.status ?? ""),
  };

  return { user, token };
}

export async function signUp(
  email: string,
  password: string,
  nickname: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nickname }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "회원가입에 실패했습니다.");
  }

  return normalizeAuthResponse(data);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "로그인에 실패했습니다.");
  }

  return normalizeAuthResponse(data);
}
