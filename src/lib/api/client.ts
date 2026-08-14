const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(
  /\/$/,
  "",
);
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// Store token in localStorage
export const setToken = (token: string) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
};

export const getMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
};

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let message = "API Error";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

// AUTH
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    apiCall("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getCurrentUser: () => apiCall("/auth/me"),
};

// EVENTS
export const eventsAPI = {
  create: (data: any) => apiCall("/events/", { method: "POST", body: JSON.stringify(data) }),
  list: (status?: string) => {
    const query = status ? `?status_filter=${encodeURIComponent(status)}` : "";
    return apiCall(`/events/${query}`);
  },
  get: (id: number) => apiCall(`/events/${id}`),
  getBySlug: (slug: string) => apiCall(`/events/slug/${encodeURIComponent(slug)}`),
  update: (id: number, data: any) =>
    apiCall(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  publish: (id: number) => apiCall(`/events/${id}/publish`, { method: "POST" }),
  delete: (id: number) => apiCall(`/events/${id}`, { method: "DELETE" }),
};

// PHOTOS
export const photosAPI = {
  upload: async (eventId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/photos/${eventId}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      let message = "Upload failed";
      try {
        message = (await response.json()).detail || message;
      } catch {}
      throw new Error(message);
    }
    return response.json();
  },
  list: (eventId: number) => apiCall(`/photos/${eventId}`),
  get: (id: number) => apiCall(`/photos/photo/${id}`),
  update: (id: number, data: any) =>
    apiCall(`/photos/photo/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  favorite: (id: number) => apiCall(`/photos/photo/${id}/favorite`, { method: "POST" }),
  unfavorite: (id: number) => apiCall(`/photos/photo/${id}/unfavorite`, { method: "POST" }),
  download: (id: number) => apiCall(`/photos/photo/${id}/download`, { method: "POST" }),
  delete: (id: number) => apiCall(`/photos/photo/${id}`, { method: "DELETE" }),
};

// ALBUMS
export const albumsAPI = {
  create: (eventId: number, data: any) =>
    apiCall(`/albums/${eventId}`, { method: "POST", body: JSON.stringify(data) }),
  list: (eventId: number) => apiCall(`/albums/${eventId}`),
  get: (id: number) => apiCall(`/albums/album/${id}`),
  update: (id: number, data: any) =>
    apiCall(`/albums/album/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/albums/album/${id}`, { method: "DELETE" }),
  addPhoto: (albumId: number, photoId: number) =>
    apiCall(`/albums/album/${albumId}/photos/${photoId}`, { method: "POST" }),
  removePhoto: (albumId: number, photoId: number) =>
    apiCall(`/albums/album/${albumId}/photos/${photoId}`, { method: "DELETE" }),
};

// LEADS
export const leadsAPI = {
  create: (data: any) => apiCall("/leads/", { method: "POST", body: JSON.stringify(data) }),
  createPublic: (eventSlug: string, data: any) =>
    apiCall(`/leads/public/${encodeURIComponent(eventSlug)}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  list: (status?: string) =>
    apiCall(`/leads/${status ? `?status_filter=${encodeURIComponent(status)}` : ""}`),
  get: (id: number) => apiCall(`/leads/${id}`),
  update: (id: number, data: any) =>
    apiCall(`/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    apiCall(`/leads/${id}/status/${encodeURIComponent(status)}`, { method: "POST" }),
  delete: (id: number) => apiCall(`/leads/${id}`, { method: "DELETE" }),
};

// ANALYTICS
export const analyticsAPI = {
  dashboard: (userId: number) => apiCall(`/analytics/dashboard/${userId}`),
  eventTraffic: (userId: number, days = 7) =>
    apiCall(`/analytics/events/${userId}/traffic?days=${days}`),
  eventPerformance: (eventId: number) => apiCall(`/analytics/event/${eventId}/performance`),
  leadsFunnel: (userId: number) => apiCall(`/analytics/leads/${userId}/funnel`),
  topPhotos: (userId: number, limit = 10) =>
    apiCall(`/analytics/top-photos/${userId}?limit=${limit}`),
};

// GUESTBOOK
export const guestbookAPI = {
  sign: (eventId: number, data: { name: string; message: string }) =>
    apiCall(`/guestbook/${eventId}`, { method: "POST", body: JSON.stringify(data) }),
  list: (eventId: number) => apiCall(`/guestbook/${eventId}`),
  listPending: (eventId: number) => apiCall(`/guestbook/${eventId}/pending`),
  approve: (eventId: number, entryId: number) =>
    apiCall(`/guestbook/${eventId}/${entryId}/approve`, { method: "POST" }),
  remove: (eventId: number, entryId: number) =>
    apiCall(`/guestbook/${eventId}/${entryId}`, { method: "DELETE" }),
};

// STUDIO
export const studioAPI = {
  create: (data: any) => apiCall("/studio/", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiCall("/studio/me"),
  getBySlug: (slug: string) => apiCall(`/studio/slug/${encodeURIComponent(slug)}`),
  getPublicEvents: (slug: string) => apiCall(`/studio/slug/${encodeURIComponent(slug)}/events`),
  getUser: (userId: number) => apiCall(`/studio/${userId}`),
  update: (data: any) => apiCall("/studio/me", { method: "PUT", body: JSON.stringify(data) }),
  updateStats: () => apiCall("/studio/me/stats/update", { method: "POST" }),
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/studio/me/logo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      let message = "Upload failed";
      try {
        message = (await response.json()).detail || message;
      } catch {}
      throw new Error(message);
    }
    return response.json();
  },
};

// PORTFOLIO
export interface PortfolioSection {
  id: number;
  section_type: string;
  title: string;
  content: Record<string, any>;
  position: number;
  visible: boolean;
}

export const portfolioAPI = {
  // Dashboard/editor
  get: () => apiCall("/portfolio/me"),

  update: (sections: PortfolioSection[]) =>
    apiCall("/portfolio/me", {
      method: "PUT",
      body: JSON.stringify({
        sections,
      }),
    }),

  deleteSection: (id: number) =>
    apiCall(`/portfolio/me/${id}`, {
      method: "DELETE",
    }),

  // Public portfolio
  getPublicBySlug: (slug: string) => apiCall(`/portfolio/slug/${encodeURIComponent(slug)}`),
};
