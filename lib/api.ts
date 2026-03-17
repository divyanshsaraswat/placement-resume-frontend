import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    return response.data.improvement_suggestions;
  },
};

export const adminApi = {
  getUsers: async (signal?: AbortSignal) => {
    const response = await api.get("/users", { signal });
    return response.data;
  },
  getLogs: async (signal?: AbortSignal) => {
    const response = await api.get("/logs", { signal }); 
    return response.data;
  },
};

export default api;
