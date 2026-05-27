import { apiFetch, getToken } from "./api";

/** Legacy helper — delegates to apiFetch with JWT from storage */
export async function refreshAndRetry<T>(
  fn: (token: string) => Promise<Response>,
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("No access token available");
  const response = await fn(token);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return response.json() as T;
}

export { apiFetch };
