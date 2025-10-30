// src/services/api.ts
//로컬 컴퓨터
//const BASE_URL = "http://192.168.0.34:8181";
const BASE_URL = "http://192.168.0.104:8181";
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

async function request<T = any>(
  path: string,
  { method = "GET", token, body, headers: extraHeaders }: ApiRequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}/api${path}`;
  const headers: Record<string, string> = { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(extraHeaders ?? {}) };
  let fetchBody: BodyInit | undefined;

  if (body != null) {
    if (isFormData(body)) {
      fetchBody = body; // FormData는 Content-Type 지정 금지
    } else if (isURLSearchParams(body)) {
      headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
      fetchBody = body.toString();
    } else if (typeof body === "string") {
      headers["Content-Type"] = headers["Content-Type"] ?? "text/plain;charset=UTF-8";
      fetchBody = body;
    } else {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      fetchBody = stringifyJSONOrThrowCircular(body);
    }
  }

  const res = await fetch(url, { method, headers, body: fetchBody });
  const rawText = await res.text();

  if (!res.ok) {
    // ✅ 디버그: 상태코드 + 응답 앞부분
    console.log(`[api.request] HTTP ${res.status} ${path} :: ${rawText.slice(0, 200)}`);
    let detail = rawText;
    try {
      const errJson = JSON.parse(rawText);
      detail = errJson.message ?? errJson.error ?? detail;
    } catch {}
    throw new Error(detail || `HTTP ${res.status}`);
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
