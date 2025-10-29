// src/services/authService.ts

const BASE_URL = "http://192.168.0.34:8181"; // 예: http://192.168.0.5:8181
// 반드시 실제 폰에서 백엔드에 접근 가능한 LAN IP로 적어. localhost 쓰면 안 됨(폰은 너 컴퓨터 아님)

export async function signUp(email: string, password: string, nickname: string) {
  const res = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, nickname }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "회원가입 실패");
  }

  return data; // { user_id, email, nickname, role, status }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "로그인 실패");
  }

  return data; // { user_id, email, nickname, role, status }
}
