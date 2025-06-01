import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://journalshe-server.azakiyasabrina.workers.dev";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/student/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post("/api/auth/login", credentials);

    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("authToken", response.data.token);
    }

    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }
  },

  getProfile: async () => {
    const response = await api.get("/api/auth/profile");
    return response.data;
  },

  registerStudent: async (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    schoolId: string;
    classIds: number[];
  }) => {
    const response = await api.post("/api/auth/register/student", data);
    return response.data;
  },

  registerTeacher: async (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    schoolId: string;
    classIds: number[];
  }) => {
    const response = await api.post("/api/auth/register/teacher", data);
    return response.data;
  },

  registerAdmin: async (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    schoolId: string;
  }) => {
    const response = await api.post("/api/auth/register/admin", data);
    return response.data;
  },
};

export const studentAPI = {
  getCurrentStudent: async () => {
    const response = await api.get("/api/students/me");
    return response.data;
  },

  getStudentById: async (studentId: string) => {
    const response = await api.get(`/api/students/${studentId}`);
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

export const teacherAPI = {
  getCurrentTeacher: async () => {
    const response = await api.get("/api/teachers/me");
    return response.data;
  },

  getTeacherById: async (teacherId: string) => {
    const response = await api.get(`/api/teachers/${teacherId}`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get("/api/teachers/me/assignments");
    return response.data;
  },

  getAssignmentWithSubmissions: async (assignmentId: string) => {
    const response = await api.get(`/api/teachers/assignments/${assignmentId}`);
    return response.data;
  },

  getMyStats: async () => {
    const response = await api.get("/api/teachers/me/stats");
    return response.data;
  },

  getMyClasses: async () => {
    const response = await api.get("/api/teachers/me/classes");
    return response.data;
  },

  getSchoolClasses: async () => {
    const response = await api.get("/api/teachers/me/school-classes");
    return response.data;
  },

  getTeacherClasses: async (teacherId: string) => {
    const response = await api.get(`/api/teachers/${teacherId}/classes`);
    return response.data;
  },

  editTeacherClass: async (data: any) => {
    const response = await api.put("/api/teachers/me/classes", data);
    return response.data;
  },

  deleteTeacherClass: async (classId: string) => {
    const response = await api.delete(`/api/teachers/me/classes/${classId}`);
    return response.data;
  },
};

export const assignmentAPI = {
  create: async (data: {
    title: string;
    description: string;
    dueDate: string;
    classId: number;
    points?: number;
  }) => {
    const response = await api.post("/api/assignments", data);
    return response.data;
  },

  getByClass: async (classId: number) => {
    const response = await api.get(`/api/assignments/class/${classId}`);
    return response.data;
  },

  getById: async (assignmentId: string) => {
    const response = await api.get(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  getWithSubmissions: async (assignmentId: string) => {
    const response = await api.get(`/api/assignments/${assignmentId}/details`);
    return response.data;
  },

  update: async (
    assignmentId: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string;
      points?: number;
    }
  ) => {
    const response = await api.put(`/api/assignments/${assignmentId}`, data);
    return response.data;
  },

  delete: async (assignmentId: string) => {
    const response = await api.delete(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get("/api/assignments/teacher/my-assignments");
    return response.data;
  },
};

export const submissionAPI = {
  create: async (data: {
    assignmentId: string;
    content: string;
    studentId?: string;
  }) => {
    const response = await api.post("/api/submissions", data);
    return response.data;
  },

  getById: async (submissionId: string) => {
    const response = await api.get(`/api/submissions/${submissionId}`);
    return response.data;
  },

  regenerateAIFeedback: async (submissionId: string) => {
    const response = await api.post(
      `/api/submissions/${submissionId}/regenerate-feedback`
    );
    return response.data;
  },
};

export const leaderboardAPI = {
  getClassLeaderboard: async (classId: string) => {
    const response = await api.get(`/api/leaderboard/class/${classId}`);
    return response.data;
  },

  getMyRanking: async () => {
    const response = await api.get("/api/leaderboard/my-ranking");
    return response.data;
  },

  updateStudentPoints: async (data: {
    studentId: string;
    points: number;
    reason?: string;
  }) => {
    const response = await api.post("/api/leaderboard/update-points", data);
    return response.data;
  },

  getCombinedLeaderboard: async (classId: string) => {
    const response = await api.get(`/api/leaderboard/combined/${classId}`);
    return response.data;
  },
};

export const loginStreakAPI = {
  record: async () => {
    const response = await api.post("/api/login-streak/record");
    return response.data;
  },

  getMyStreak: async () => {
    const response = await api.get("/api/login-streak/my-streak");
    return response.data;
  },

  getStreakLeaderboard: async (classId: string) => {
    const response = await api.get(`/api/login-streak/leaderboard/${classId}`);
    return response.data;
  },

  getStreakStats: async () => {
    const response = await api.get("/api/login-streak/stats");
    return response.data;
  },

  getLoginHistory: async () => {
    const response = await api.get("/api/login-streak/history");
    return response.data;
  },
};

export const schoolAPI = {
  createSchool: async (data: {
    name: string;
    address?: string;
    description?: string;
  }) => {
    const response = await api.post("/api/school/school", data);
    return response.data;
  },

  createClass: async (data: {
    name: string;
    schoolId: string;
    description?: string;
    level?: string;
  }) => {
    const response = await api.post("/api/school/class", data);
    return response.data;
  },

  listSchools: async () => {
    const response = await api.get("/api/school/school");
    return response.data;
  },

  listClasses: async () => {
    const response = await api.get("/api/school/class");
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
