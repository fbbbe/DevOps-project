// src/services/api.ts

import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. AsyncStorage 임포트
const BASE_URL = "http://192.168.0.34:8181";


export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: any;
  headers?: Record<string, string>;
};

function isFormData(v: any): v is FormData {
  return typeof FormData !== "undefined" && v instanceof FormData;
}
function isURLSearchParams(v: any): v is URLSearchParams {
  return typeof URLSearchParams !== "undefined" && v instanceof URLSearchParams;
}
function stringifyJSONOrThrowCircular(o: any): string {
  const seen = new WeakSet<any>();
  return JSON.stringify(o, (k, v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) {
        throw new Error("[api.request] 요청 body에 순환 참조가 있어요. 전송할 필드만 골라서 POJO로 만들어 주세요.");
      }
      seen.add(v);
    }
    return v;
  });
}
function withQuery(path: string, query?: Record<string, any> | URLSearchParams): string {
  if (!query) return path;
  const qs =
    query instanceof URLSearchParams
      ? query.toString()
      : new URLSearchParams(
          Object.fromEntries(
            Object.entries(query).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)])
          )
        ).toString();
  return qs ? `${path}${path.includes("?") ? "&" : "?"}${qs}` : path;
}

/* === request 함수 수정 ===
*/
export async function request<T>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  const { method, token: explicitToken, body, headers: customHeaders } = options ?? {};
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = { ...(customHeaders ?? {}) };
  
  // --- 2. [수정] 토큰 자동 주입 로직 ---
  let token = explicitToken; 

  if (!token) { 
    try {
      // 1단계에서 저장한 'userToken'을 자동으로 가져옵니다.
      const storedToken = await AsyncStorage.getItem('userToken'); 
      if (storedToken) {
        token = storedToken;
      }
    } catch (e) {
      console.warn("AsyncStorage에서 토큰을 가져오는 데 실패했습니다.", e);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    if (__DEV__) {
      console.log(
        "[api.request] auth token attached",
        headers["Authorization"].slice(0, 20) + "..."
      );
    }
  }
  // --- [수정 끝] ---

  // 3. Body 처리 (기존과 동일)
  let fetchBody: string | FormData | undefined = undefined;
  if (body) {
    if (isFormData(body) || typeof body === 'string') {
      fetchBody = body;
    } else {
      headers["Content-Type"] = "application/json";
      fetchBody = stringifyJSONOrThrowCircular(body);
    }
  }

  // 4. Fetch 실행 (기존과 동일)
  const res = await fetch(url, { method, headers, body: fetchBody });
  const rawText = await res.text();

  if (!res.ok) {
    // 서버에서 내려준 에러 메시지를 최대한 추출
    let message: string | undefined;
    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        message =
          (typeof parsed === "string" && parsed) ||
          (parsed && typeof parsed.error === "string" && parsed.error) ||
          (parsed && typeof parsed.message === "string" && parsed.message);
      } catch {
        message = rawText;
      }
    }

    const errorMessage =
      message?.trim() ||
      `요청이 실패했습니다. (HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""})`;
    throw new Error(errorMessage);
  }

  if (!rawText) return null as T;
  try { return JSON.parse(rawText) as T; } catch { return rawText as unknown as T; }
}

const get = <T = any>(path: string, query?: Record<string, any> | URLSearchParams, opts?: Omit<ApiRequestOptions, "method" | "body">) =>
  request<T>(withQuery(path, query), { ...(opts ?? {}), method: "GET" });
const postJSON = <T = any>(path: string, json: any, opts?: Omit<ApiRequestOptions, "method">) =>
  request<T>(path, { ...(opts ?? {}), method: "POST", body: json });
const postFormData = <T = any>(path: string, form: FormData, opts?: Omit<ApiRequestOptions, "method">) =>
  request<T>(path, { ...(opts ?? {}), method: "POST", body: form });
const postURLEncoded = <T = any>(path: string, params: URLSearchParams | Record<string, any>, opts?: Omit<ApiRequestOptions, "method">) =>
  request<T>(path, { ...(opts ?? {}), method: "POST", body: params instanceof URLSearchParams ? params : new URLSearchParams(params as any) });

export default { request, get, postJSON, postFormData, postURLEncoded };
export const API_BASE_URL = BASE_URL;
