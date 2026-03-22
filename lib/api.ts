import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
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
  createResume: async (type: string, initial_latex: string = "", format: string = "latex", file?: File, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("initial_latex", initial_latex);
    formData.append("format", format);
    if (file) {
      formData.append("file", file);
    }
    const response = await api.post("/resumes", formData, { 
      headers: {
        "Content-Type": "multipart/form-data" // Axios in recent versions handles this correctly with FormData
      },
      signal 
    });
    return response.data;
  },
  addVersion: async (resumeId: string, type: string, latex_code: string = "", format: string = "latex", file?: File, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("latex_code", latex_code);
    formData.append("format", format);
    if (file) {
      formData.append("file", file);
    }
    const response = await api.post(`/resumes/${resumeId}/version`, formData, { 
      headers: {
        "Content-Type": "multipart/form-data"
      },
      signal 
    });
    return response.data;
  },
  saveResume: async (id: string, updates: Record<string, any>, signal?: AbortSignal) => {
    const response = await api.patch(`/resumes/${id}`, updates, { signal });
    return response.data;
  },
  deleteResume: async (id: string, signal?: AbortSignal) => {
    const response = await api.delete(`/resumes/${id}`, { signal });
    return response.data;
  },
  deleteVersion: async (resumeId: string, versionId: string, signal?: AbortSignal) => {
    const response = await api.delete(`/resumes/${resumeId}/versions/${versionId}`, { signal });
    return response.data;
  },
  submitResume: async (id: string, signal?: AbortSignal) => {
    const response = await api.post(`/resumes/${id}/submit`, null, { signal });
    return response.data;
  },
  setDefaultResume: async (id: string, signal?: AbortSignal) => {
    const response = await api.post(`/resumes/${id}/set-default`, null, { signal });
    return response.data;
  },
  updateVersionStatus: async (resumeId: string, versionId: string, status: string, remark?: string, signal?: AbortSignal) => {
    const params: any = { status };
    if (remark) params.remark = remark;
    const response = await api.patch(`/resumes/${resumeId}/versions/${versionId}/status`, null, { 
      params,
      signal 
    });
    return response.data;
  },
  compilePdf: async (latex: string, signal?: AbortSignal) => {
    const response = await api.post("/latex/compile", { latex_code: latex }, { signal });
    return response.data.pdf_url;
  },
  compileAsync: async (latex: string, signal?: AbortSignal) => {
    const response = await api.post("/latex/compile-async", { latex_code: latex }, { signal });
    return response.data as { job_id: string; queue_position: number; eta_seconds: number };
  },
  getCompileStatus: async (jobId: string, signal?: AbortSignal) => {
    const response = await api.get(`/latex/status/${jobId}`, { signal });
    return response.data as {
      status: string;
      position?: number;
      eta_seconds?: number;
      success?: boolean;
      error?: string;
      pdf_url?: string;
    };
  },
  cleanupLatexJob: async (jobId: string, signal?: AbortSignal) => {
    const response = await api.delete(`/latex/${jobId}`, { signal });
    return response.data;
  },

  getStats: async (signal?: AbortSignal) => {
    const response = await api.get("/resumes/stats", { signal });
    return response.data;
  },
  getSuggestions: async (content: string, signal?: AbortSignal) => {
    const response = await api.post("/ai/score-resume", { resume_text: content }, { signal });
    return response.data;
  },
  streamChat: async (messages: { role: string; content: string }[], onChunk: (chunk: string) => void, resume_content?: string, format: string = "latex") => {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ messages, resume_content, format }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data) onChunk(data);
        }
      }
    }
  },
  getValidationQueue: async (params: { search?: string; year?: number | number[]; department?: string|string[]; group?: string; limit?: number }, signal?: AbortSignal) => {
    // ... same as before
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    if (params.group) searchParams.append("group", params.group);
    if (params.limit) searchParams.append("limit", params.limit.toString());
    
    if (params.year) {
      if (Array.isArray(params.year)) {
        params.year.forEach(y => searchParams.append("year", y.toString()));
      } else {
        searchParams.append("year", params.year.toString());
      }
    }
    
    if (params.department) {
      if (Array.isArray(params.department)) {
        params.department.forEach(d => searchParams.append("department", d));
      } else {
        searchParams.append("department", params.department);
      }
    }

    const response = await api.get("/resumes/validation-queue", { params: searchParams, signal });
    return response.data;
  },
  getValidationStats: async (signal?: AbortSignal) => {
    const response = await api.get("/resumes/validation-stats", { signal });
    return response.data;
  },
};

export const adminApi = {
  getUsers: async (role?: string, signal?: AbortSignal) => {
    const response = await api.get("/users", { params: { role }, signal });
    return response.data;
  },
  getStats: async (signal?: AbortSignal) => {
    const response = await api.get("/users/stats", { signal });
    return response.data;
  },
  getStudents: async (params: { search?: string; year?: number | number[]; department?: string | string[] }, signal?: AbortSignal) => {
    // ...
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    
    if (params.year) {
      if (Array.isArray(params.year)) {
        params.year.forEach(y => searchParams.append("year", y.toString()));
      } else {
        searchParams.append("year", params.year.toString());
      }
    }
    
    if (params.department) {
      if (Array.isArray(params.department)) {
        params.department.forEach(d => searchParams.append("department", d));
      } else {
        searchParams.append("department", params.department);
      }
    }

    const response = await api.get("/users/students", { params: searchParams, signal });
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
  createUser: async (data: { name: string; email: string; role: string; department?: string; year?: number }) => {
    const response = await api.post("/users", data);
    return response.data;
  },
  getLogs: async (params: { search?: string; log_type?: string; skip?: number; limit?: number }, signal?: AbortSignal) => {
    const response = await api.get("/logs", { params, signal }); 
    return response.data;
  },
  getLogStats: async (signal?: AbortSignal) => {
    const response = await api.get("/logs/stats", { signal });
    return response.data;
  },
  getStudentAnalytics: async (signal?: AbortSignal) => {
    const response = await api.get("/users/students/analytics", { signal });
    return response.data;
  },
  exportLogs: async (params: { search?: string; log_type?: string }, signal?: AbortSignal) => {
    const response = await api.get("/logs/export", { 
      params, 
      signal,
      responseType: 'blob' 
    });
    return response.data;
  },
  exportLogsUrl: (params: { search?: string; log_type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    if (params.log_type) searchParams.append("log_type", params.log_type);
    return `${api.defaults.baseURL}/logs/export?${searchParams.toString()}`;
  },
};

export const llmApi = {
  getModelsInfo: async (signal?: AbortSignal) => {
    const response = await api.get("/users/llm/models-info", { signal });
    return response.data;
  },
};

export const notificationApi = {
  getNotifications: async (limit: number = 20, signal?: AbortSignal) => {
    const response = await api.get("/notifications", { params: { limit }, signal });
    return response.data;
  },
  getUnreadCount: async (signal?: AbortSignal) => {
    const response = await api.get("/notifications/unread-count", { signal });
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },
};

export default api;
