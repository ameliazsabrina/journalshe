export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role?: {
    name: string;
  };
}

export interface School {
  id: string;
  name: string;
  address?: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  school?: School;
  user?: User;
}

export interface Student {
  id: string;
  userId: string;
  classId: string;
  schoolId: string;
  classLevel: string;
  streakDays: number;
  totalPoints: number;
  lastLogin: string;
  user?: User;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  teacherId: string;
}

export interface Submission {
  id: string;
  content: string;
  submittedAt: string;
  aiFeedback?: string;
  aiScore?: number;
  feedbackGeneratedAt?: string;
  studentId: string;
  assignmentId: string;
  student?: Student;
}

export interface TeacherProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  school?: School;
  classes: Class[];
}

export interface AssignmentWithStats extends Assignment {
  submissionCount: number;
  totalStudents: number;
  pointsPossible: number;
}
