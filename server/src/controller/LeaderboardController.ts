import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

export const getClassLeaderboard = async (c: Context<{ Bindings: Env }>) => {
  try {
    const classId = c.req.param("classId");
    const { period = "all" } = c.req.query();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student } = await supabase(c)
      .from("Student")
      .select("classId")
      .eq("userId", userId)
      .single();

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (!student && !teacher) {
      return c.json({ error: "Access denied: Not a student or teacher" }, 403);
    }

    if (student && student.classId.toString() !== classId) {
      return c.json({ error: "Access denied: Not in this class" }, 403);
    }

    let dateFilter = new Date(0);
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "semester":
        const currentMonth = now.getMonth();
        dateFilter =
          currentMonth >= 8
            ? new Date(now.getFullYear(), 8, 1)
            : new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        dateFilter = new Date(0);
        break;
    }

    let query = supabase(c)
      .from("ClassLeaderboard")
      .select(
        `
        studentId,
        classId,
        points,
        updated,
        student:Student(
          id,
          user:User(username, fullName)
        )
      `
      )
      .eq("classId", parseInt(classId))
      .order("updated", { ascending: false });

    if (period !== "all") {
      query = query.gte("updated", dateFilter.toISOString());
    }

    const { data: basicData, error: basicError } = await query;

    if (basicError) {
      console.error("Error with leaderboard query:", basicError);
      return c.json({ error: "Failed to fetch leaderboard data" }, 500);
    }

    const studentPoints = new Map();
    basicData?.forEach((entry: any) => {
      const studentId = entry.studentId;
      if (!studentPoints.has(studentId)) {
        studentPoints.set(studentId, {
          studentId,
          classId: entry.classId,
          points: 0,
          lastUpdated: entry.updated,
          student: entry.student,
        });
      }
      const current = studentPoints.get(studentId);
      current.points += entry.points;
      if (new Date(entry.updated) > new Date(current.lastUpdated)) {
        current.lastUpdated = entry.updated;
      }
    });

    const aggregatedData = Array.from(studentPoints.values())
      .sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        id: student.studentId,
        user: student.student?.user || {
          username: "Unknown",
          fullName: "Unknown",
        },
        points: student.points,
        rank: index + 1,
        updated: student.lastUpdated,
      }));

    return c.json(aggregatedData, 200);
  } catch (error) {
    console.error("Error in getClassLeaderboard:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getMyRanking = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { period = "all" } = c.req.query();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("id, classId")
      .eq("userId", userId)
      .single();

    if (studentError || !student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const classId = student.classId;

    let dateFilter = new Date(0);
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "semester":
        const currentMonth = now.getMonth();
        dateFilter =
          currentMonth >= 8
            ? new Date(now.getFullYear(), 8, 1)
            : new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        dateFilter = new Date(0);
        break;
    }

    let query = supabase(c)
      .from("ClassLeaderboard")
      .select(
        `
        studentId,
        classId,
        points,
        updated,
        student:Student(
          id,
          user:User(username, fullName)
        )
      `
      )
      .eq("classId", classId)
      .order("updated", { ascending: false });

    if (period !== "all") {
      query = query.gte("updated", dateFilter.toISOString());
    }

    const { data: basicData, error: basicError } = await query;

    if (basicError) {
      console.error("Error fetching leaderboard for ranking:", basicError);
      return c.json({ error: "Failed to fetch ranking data" }, 500);
    }

    const studentPoints = new Map();
    basicData?.forEach((entry: any) => {
      const studentId = entry.studentId;
      if (!studentPoints.has(studentId)) {
        studentPoints.set(studentId, {
          studentId,
          classId: entry.classId,
          points: 0,
          lastUpdated: entry.updated,
          student: entry.student,
        });
      }
      const current = studentPoints.get(studentId);
      current.points += entry.points;
      if (new Date(entry.updated) > new Date(current.lastUpdated)) {
        current.lastUpdated = entry.updated;
      }
    });

    const aggregatedData = Array.from(studentPoints.values()).sort(
      (a, b) => b.points - a.points
    );

    const myRankingIndex = aggregatedData.findIndex(
      (entry) => entry.studentId === student.id
    );

    if (myRankingIndex === -1) {
      return c.json({
        rank: "N/A",
        points: 0,
        classId: student.classId,
        totalStudents: aggregatedData.length,
      });
    }

    const myData = aggregatedData[myRankingIndex];
    return c.json({
      rank: myRankingIndex + 1,
      points: myData.points,
      classId: student.classId,
      totalStudents: aggregatedData.length,
      updated: myData.lastUpdated,
    });
  } catch (error) {
    console.error("Error in getMyRanking:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const updateStudentPoints = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { studentId, points } = await c.req.json();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Access denied: Teacher only" }, 403);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("classId")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const { error: pointsError } = await supabase(c)
      .from("ClassLeaderboard")
      .insert([
        {
          studentId,
          classId: student.classId,
          points,
          updated: new Date().toISOString(),
        },
      ]);

    if (pointsError) {
      console.error("Error adding points:", pointsError);
      return c.json({ error: "Failed to add points" }, 500);
    }

    return c.json({ message: "Points added successfully" }, 201);
  } catch (error) {
    console.error("Error in updateStudentPoints:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getCombinedLeaderboard = async (c: Context<{ Bindings: Env }>) => {
  try {
    const classId = c.req.param("classId");
    const { period = "all" } = c.req.query();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student } = await supabase(c)
      .from("Student")
      .select("classId")
      .eq("userId", userId)
      .single();

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (!student && !teacher) {
      return c.json({ error: "Access denied: Not a student or teacher" }, 403);
    }

    if (student && student.classId.toString() !== classId) {
      return c.json({ error: "Access denied: Not in this class" }, 403);
    }

    let dateFilter = new Date(0);
    const now = new Date();

    switch (period) {
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case "semester":
        const currentMonth = now.getMonth();
        dateFilter =
          currentMonth >= 8
            ? new Date(now.getFullYear(), 8, 1)
            : new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        dateFilter = new Date(0);
        break;
    }

    let pointsQuery = supabase(c)
      .from("ClassLeaderboard")
      .select(
        `
        studentId,
        points,
        updated
      `
      )
      .eq("classId", parseInt(classId))
      .order("updated", { ascending: false });

    if (period !== "all") {
      pointsQuery = pointsQuery.gte("updated", dateFilter.toISOString());
    }

    const { data: pointsData, error: pointsError } = await pointsQuery;

    if (pointsError) {
      console.error("Error fetching points data:", pointsError);
      return c.json({ error: "Failed to fetch points data" }, 500);
    }

    const studentPoints = new Map();
    pointsData?.forEach((entry: any) => {
      const studentId = entry.studentId;
      if (!studentPoints.has(studentId)) {
        studentPoints.set(studentId, 0);
      }
      studentPoints.set(studentId, studentPoints.get(studentId) + entry.points);
    });

    const { data: studentsData, error: studentsError } = await supabase(c)
      .from("Student")
      .select(
        `
        id,
        streakDays,
        lastLogin,
        user:User(username, fullName)
      `
      )
      .eq("classId", parseInt(classId));

    if (studentsError) {
      console.error("Error fetching students data:", studentsError);
      return c.json({ error: "Failed to fetch students data" }, 500);
    }

    const combinedData =
      studentsData?.map((student: any) => ({
        id: student.id,
        user: student.user,
        points: studentPoints.get(student.id) || 0,
        streakDays: student.streakDays,
        lastLogin: student.lastLogin,
        totalScore:
          (studentPoints.get(student.id) || 0) + student.streakDays * 5,
      })) || [];

    combinedData.sort((a: any, b: any) => b.totalScore - a.totalScore);

    const leaderboard = combinedData.map((student: any, index: number) => ({
      ...student,
      rank: index + 1,
    }));

    return c.json(leaderboard, 200);
  } catch (error) {
    console.error("Error in getCombinedLeaderboard:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
