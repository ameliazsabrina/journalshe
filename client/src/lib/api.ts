import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For cookie-based auth
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 errors
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        // Redirect to login if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/student/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post("/api/auth/login", credentials);

    // Store token in localStorage if returned
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("authToken", response.data.token);
    }

    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      // Always clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }
  },

  getProfile: async () => {
    const response = await api.get("/api/auth/profile");
    return response.data;
  },
};

// Student API functions
export const studentAPI = {
  getCurrentStudent: async () => {
    const response = await api.get("/api/students/me");
    return response.data;
  },

  getSubmissions: async (studentId: string) => {
    const response = await api.get(`/api/students/${studentId}/submissions`);
    return response.data;
  },

  getStreaks: async (studentId: string) => {
    const response = await api.get(`/api/students/${studentId}/streaks`);
    return response.data;
  },
};

// Assignment API functions
export const assignmentAPI = {
  getByClass: async (classId: number) => {
    const response = await api.get(`/api/assignments/class/${classId}`);
    return response.data;
  },
};

// Login streak API functions
export const loginStreakAPI = {
  record: async () => {
    const response = await api.post("/api/login-streak/record");
    return response.data;
  },

  getMyStreak: async () => {
    const response = await api.get("/api/login-streak/my-streak");
    return response.data;
  },
};

export default api;
