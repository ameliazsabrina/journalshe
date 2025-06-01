import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

export const getStudentById = async (c: Context<{ Bindings: Env }>) => {
  try {
    const studentId = c.req.param("studentId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select(
        `
        *,
        user:User(*),
        school:School(*),
        class:Class(*)
      `
      )
      .eq("id", studentId)
      .single();

    if (studentError) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (student.userId !== userId) {
      return c.json({ error: "Access denied" }, 403);
    }

    return c.json(student, 200);
  } catch (error) {
    console.error("Error fetching student:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getStudentSubmissions = async (c: Context<{ Bindings: Env }>) => {
  try {
    const studentId = c.req.param("studentId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("userId")
      .eq("id", studentId)
      .single();

    if (studentError) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (student.userId !== userId) {
      return c.json({ error: "Access denied" }, 403);
    }

    const { data: submissions, error: submissionsError } = await supabase(c)
      .from("Submission")
      .select(
        `
        *,
        assignment:Assignment(*)
      `
      )
      .eq("studentId", studentId)
      .order("submittedAt", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return c.json({ error: "Failed to fetch submissions" }, 500);
    }

    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      assignment: {
        id: submission.assignment?.id,
        title: submission.assignment?.title,
        description: submission.assignment?.description,
        due_date: submission.assignment?.dueDate,
        points_possible: submission.assignment?.points || 100,
      },
      status: submission.aiFeedback
        ? "graded"
        : submission.submittedAt
        ? "submitted"
        : "draft",
      points_earned: submission.aiScore,
      submitted_at: submission.submittedAt,
      graded_at: submission.feedbackGeneratedAt,
      feedback: submission.aiFeedback,
      content: submission.content,
    }));

    return c.json(transformedSubmissions, 200);
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getStudentStreaks = async (c: Context<{ Bindings: Env }>) => {
  try {
    const studentId = c.req.param("studentId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("userId")
      .eq("id", studentId)
      .single();

    if (studentError) {
      return c.json({ error: "Student not found" }, 404);
    }

    if (student.userId !== userId) {
      return c.json({ error: "Access denied" }, 403);
    }

    const { data: streaks, error: streaksError } = await supabase(c)
      .from("LoginStreak")
      .select("*")
      .eq("userId", userId)
      .order("loginDate", { ascending: false })
      .limit(30);

    if (streaksError) {
      console.error("Error fetching streaks:", streaksError);
      return c.json({ error: "Failed to fetch streaks" }, 500);
    }

    const currentStreak = calculateCurrentStreak(streaks);

    const transformedStreaks = streaks.map((streak: any, index: number) => ({
      id: streak.id,
      user_id: streak.userId,
      current_streak: index === 0 ? currentStreak : undefined,
      longest_streak: undefined,
      last_login_date: streak.loginDate,
      total_logins: streaks.length,
      loginDate: streak.loginDate,
      consecutive: streak.consecutive,
    }));

    return c.json(transformedStreaks, 200);
  } catch (error) {
    console.error("Error fetching student streaks:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

const calculateCurrentStreak = (streaks: any[]): number => {
  if (!streaks || streaks.length === 0) return 0;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < streaks.length; i++) {
    const streakDate = new Date(streaks[i].loginDate);
    streakDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === i && streaks[i].consecutive) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
};

export const getCurrentStudent = async (c: Context<{ Bindings: Env }>) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select(
        `
        *,
        user:User(*),
        school:School(*),
        class:Class(*)
      `
      )
      .eq("userId", userId)
      .single();

    if (studentError) {
      return c.json({ error: "Student profile not found" }, 404);
    }

    return c.json(student, 200);
  } catch (error) {
    console.error("Error fetching current student:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
