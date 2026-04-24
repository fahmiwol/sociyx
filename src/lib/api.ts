const BASE = "/api";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => req<T>("GET", path),
  post: <T>(path: string, body: unknown) => req<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => req<T>("PUT", path, body),
  delete: <T>(path: string) => req<T>("DELETE", path),
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ ok: boolean; user: any }>("/auth/login", { email, password }),
  register: (email: string, password: string, fullName: string, orgName: string) =>
    api.post<{ ok: boolean }>("/auth/register", { email, password, fullName, orgName }),
  logout: () => api.post<{ ok: boolean }>("/auth/logout", {}),
  me: () => api.get<{ user: any }>("/auth/me"),
};

// Clients
export const clientsApi = {
  list: () => api.get<{ clients: any[] }>("/clients"),
  get: (id: number) => api.get<{ client: any }>(`/clients/${id}`),
  create: (data: any) => api.post<{ id: number }>("/clients", data),
  update: (id: number, data: any) => api.put<{ ok: boolean }>(`/clients/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/clients/${id}`),
};

// Posts
export const postsApi = {
  list: (params?: { client_id?: number; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return api.get<{ posts: any[]; total: number }>(`/posts${qs}`);
  },
  get: (id: number) => api.get<{ post: any }>(`/posts/${id}`),
  create: (data: any) => api.post<{ id: number }>("/posts", data),
  update: (id: number, data: any) => api.put<{ ok: boolean }>(`/posts/${id}`, data),
  delete: (id: number) => api.delete<{ ok: boolean }>(`/posts/${id}`),
  dashboard: () => api.get<any>("/posts/stats/dashboard"),
  schedulerLog: () => api.get<{ logs: any[] }>("/posts/scheduler/log"),
};

// AI
export const aiApi = {
  caption: (data: { topic: string; platform: string; tone: string; clientId?: number }) =>
    api.post<{ caption: string }>("/ai/caption", data),
  hashtags: (data: { topic: string; platform: string; clientId?: number }) =>
    api.post<{ hashtags: string[] }>("/ai/hashtags", data),
  brandGuidelines: (data: { clientName: string; industry?: string; description?: string }) =>
    api.post<{ guidelines: any }>("/ai/brand-guidelines", data),
};

// Media
export const mediaApi = {
  list: (clientId?: number) => {
    const qs = clientId ? `?client_id=${clientId}` : "";
    return api.get<{ assets: any[] }>(`/media${qs}`);
  },
  upload: async (file: File, clientId?: number) => {
    const form = new FormData();
    form.append("file", file);
    if (clientId) form.append("client_id", String(clientId));
    const res = await fetch("/api/media/upload", { method: "POST", credentials: "include", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  delete: (id: number) => api.delete<{ ok: boolean }>(`/media/${id}`),
};
