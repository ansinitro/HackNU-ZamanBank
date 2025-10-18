// src/lib/api.ts
export async function apiFetch<T = any>(path: string, opts: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const isFormData = opts.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(opts.headers as Record<string, string> || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(base + path, {
      credentials: "include",
      ...opts,
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
      throw { status: res.status, body: json };
    }

    if (res.status === 204) return null as unknown as T;
    return res.json() as Promise<T>;
  } catch (e) {
    if ((e as any).status === 401) {
      console.log("401 err from backend");
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    throw e;
  }
}
