// src/services/api.ts

// ORDS 서버의 베이스 URL.
// 실제 ORDS 주소에 맞게 바꿔야 함.
// - 로컬 PC에서 ORDS 실행 중이고 Android 에뮬레이터로 접근한다면 예: http://10.0.2.2:8080/ords/studyup
// - 원격 서버라면 예: https://your-server/ords/studyup
const BASE_URL = "http://192.168.0.34:8181"; // 사용자 PC의 IP 주소로 변경할 것

export type ApiRequestOptions = {
  method?: string;
  token?: string;
  body?: any;
};

async function request<T = any>(
  path: string,
  { method = "GET", token, body }: ApiRequestOptions = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // 서버에서 에러 메시지를 JSON으로 줄 수도 있고 없을 수도 있음
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson.message || JSON.stringify(errJson);
    } catch {
      detail = await res.text();
    }
    throw new Error(`[${res.status}] ${detail}`);
  }

  // 204 같은 빈 응답 방어
  const text = await res.text();
  if (!text) return null as T;

  return JSON.parse(text) as T;
}

export default {
  request,
};
