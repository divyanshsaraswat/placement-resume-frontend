import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      // Optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  loginGoogle: async (token: string) => {
    const response = await api.post("/auth/login/google", null, {
      params: { token },
    });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const resumeApi = {
  getResumes: async () => {
    const response = await api.get("/resumes/my");
    return response.data;
  },
  getResume: async (id: string) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  saveResume: async (id: string, content: string) => {
    const response = await api.patch(`/resumes/${id}`, { content });
    return response.data;
  },
  compilePdf: async (latex: string) => {
    const response = await api.post("/latex/compile", { latex });
    return response.data.pdf_url;
  },
  getSuggestions: async (content: string) => {
    const response = await api.post("/ai/score-resume", { latex: content });
    return response.data.suggestions;
  },
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getLogs: async () => {
    const response = await api.get("/logs"); // Placeholder if logs exist
    return response.data;
  },
};

export default api;
