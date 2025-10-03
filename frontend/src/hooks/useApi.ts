import { useAuth } from "@/contexts/AuthContext";

export const API_BASE = import.meta.env.VITE_APP_API_BASE || "http://localhost:5000/api";

export function useApi() {
  const { getToken } = useAuth();

  async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...opts,
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      let body = text;
      try { body = JSON.parse(text); } catch { /* empty */ }
      throw { status: res.status, body };
    }

    return (await res.json()) as T;
  }

  return { request };
}
