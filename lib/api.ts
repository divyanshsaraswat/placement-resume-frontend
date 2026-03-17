import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 120 seconds
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // We don't remove the token immediately to avoid race conditions 
      // where a single failed background request nukes the whole session.
      // AuthProvider or the Component will handle the redirect.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        // Optional: redirect to login but don't nuke storage yet
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  loginGoogle: async (token: string, signal?: AbortSignal) => {
    const response = await api.post("/auth/login/google", null, {
      params: { token },
      signal
    });
    return response.data;
  },
  getMe: async (signal?: AbortSignal) => {
    const response = await api.get("/auth/me", { signal });
    return response.data;
  },
};

export const resumeApi = {
  getResumes: async (signal?: AbortSignal) => {
    const response = await api.get("/resumes", { signal });
    return response.data;
  },
  getResume: async (id: string, signal?: AbortSignal) => {
    const response = await api.get(`/resumes/${id}`, { signal });
    return response.data;
  },
  createResume: async (type: string, initial_latex: string, signal?: AbortSignal) => {
    const response = await api.post("/resumes", { type, initial_latex }, { signal });
    return response.data;
  },
  saveResume: async (id: string, content: string, signal?: AbortSignal) => {
    const response = await api.patch(`/resumes/${id}`, { content }, { signal });
    return response.data;
  },
  compilePdf: async (latex: string, signal?: AbortSignal) => {
    const response = await api.post("/latex/compile", { latex_code: latex }, { signal });
    return response.data.pdf_url;
  },
  getSuggestions: async (content: string, signal?: AbortSignal) => {
    const response = await api.post("/ai/score-resume", { resume_text: content }, { signal });
    return response.data;
  },
  streamChat: async (messages: { role: string; content: string }[], onChunk: (chunk: string) => void) => {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error("Failed to stream chat");
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ""; 
      for (const part of parts) {
        const line = part.trim();
        if (line.startsWith("data: ")) {
          onChunk(line.slice(6));
        }
      }
    }
  },
  getValidationQueue: async (params: { search?: string; year?: number; department?: string; group?: string }, signal?: AbortSignal) => {
    const response = await api.get("/resumes/validation-queue", { params, signal });
    return response.data;
  },
};

export const adminApi = {
  getUsers: async (role?: string, signal?: AbortSignal) => {
    const response = await api.get("/users", { params: { role }, signal });
    return response.data;
  },
  getStudents: async (params: { search?: string; year?: number; department?: string }, signal?: AbortSignal) => {
    const response = await api.get("/users/students", { params, signal });
    return response.data;
  },
  updateUser: async (userId: string, data: any) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  getLogs: async (signal?: AbortSignal) => {
    const response = await api.get("/logs", { signal }); 
    return response.data;
  },
};

export default api;
