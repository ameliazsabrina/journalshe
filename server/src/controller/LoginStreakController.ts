import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import type { Env } from "..";
import * as dotenv from "dotenv";

dotenv.config();

export const recordLogin = async (c: Context<{ Bindings: Env }>) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("id, userId, streakDays, lastLogin, classId")
      .eq("userId", userId)
      .single();

    if (studentError || !student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const today = new Date();
    const todayDateString = today.toISOString().split("T")[0];

    const { data: existingLogin } = await supabase(c)
      .from("LoginStreak")
      .select("id")
      .eq("userId", userId)
      .eq("loginDate", todayDateString)
      .single();

    if (existingLogin) {
      return c.json({
        message: "Already logged in today",
        currentStreak: student.streakDays,
        loginDate: todayDateString,
        bonusPoints: 0,
      });
    }

    const lastLoginDate = student.lastLogin
      ? new Date(student.lastLogin)
      : null;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let isConsecutive = false;
    let newStreakDays = 1;

    if (lastLoginDate) {
      const lastLoginDateString = lastLoginDate.toISOString().split("T")[0];
      const yesterdayDateString = yesterday.toISOString().split("T")[0];

      if (lastLoginDateString === yesterdayDateString) {
        isConsecutive = true;
        newStreakDays = student.streakDays + 1;
      } else if (lastLoginDateString === todayDateString) {
        return c.json({
          message: "Already logged in today",
          currentStreak: student.streakDays,
          bonusPoints: 0,
        });
      } else {
        isConsecutive = false;
        newStreakDays = 1;
      }
    }

    const { error: loginStreakError } = await supabase(c)
      .from("LoginStreak")
      .upsert(
        [
          {
            loginDate: todayDateString,
            consecutive: isConsecutive,
            userId: userId,
          },
        ],
        {
          onConflict: "userId,loginDate",
        }
      );

    if (loginStreakError) {
      console.error("Error recording login streak:", loginStreakError);
      return c.json({ error: "Failed to record login streak" }, 500);
    }

    const { error: updateError } = await supabase(c)
      .from("Student")
      .update({
        streakDays: newStreakDays,
        lastLogin: today.toISOString(),
      })
      .eq("userId", userId);

    if (updateError) {
      console.error("Error updating student streak:", updateError);
      return c.json({ error: "Failed to update student streak" }, 500);
    }

    let bonusPoints = 0;
    if (newStreakDays >= 7) bonusPoints = 50;
    else if (newStreakDays >= 3) bonusPoints = 20;
    else if (isConsecutive) bonusPoints = 10;

    if (bonusPoints > 0) {
      const { error: pointsError } = await supabase(c)
        .from("ClassLeaderboard")
        .insert([
          {
            studentId: student.id,
            classId: student.classId || 1,
            points: bonusPoints,
            updated: today.toISOString(),
          },
        ]);

      if (pointsError) {
        console.error("Error adding streak bonus points:", pointsError);
      }
    }

    return c.json({
      message: "Login recorded successfully",
      currentStreak: newStreakDays,
      isConsecutive,
      bonusPoints,
      loginDate: todayDateString,
    });
  } catch (error) {
    console.error("Error in recordLogin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getMyStreak = async (c: Context<{ Bindings: Env }>) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("id, streakDays, lastLogin, user:User(username, fullName)")
      .eq("userId", userId)
      .single();

    if (studentError || !student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLogins, error: loginsError } = await supabase(c)
      .from("LoginStreak")
      .select("loginDate, consecutive")
      .eq("userId", userId)
      .gte("loginDate", thirtyDaysAgo.toISOString().split("T")[0])
      .order("loginDate", { ascending: false });

    if (loginsError) {
      console.error("Error fetching login history:", loginsError);
      return c.json({ error: "Failed to fetch login history" }, 500);
    }

    return c.json({
      currentStreak: student.streakDays,
      lastLogin: student.lastLogin,
      user: student.user,
      recentLogins: recentLogins || [],
    });
  } catch (error) {
    console.error("Error in getMyStreak:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getStreakLeaderboard = async (c: Context<{ Bindings: Env }>) => {
  try {
    const classId = c.req.param("classId");
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

    const { data: streakData, error: streakError } = await supabase(c)
      .from("Student")
      .select(
        `
        id,
        streakDays,
        lastLogin,
        user:User(username, fullName)
      `
      )
      .eq("classId", parseInt(classId))
      .order("streakDays", { ascending: false })
      .limit(50);

    if (streakError) {
      console.error("Error fetching streak leaderboard:", streakError);
      return c.json({ error: "Failed to fetch streak leaderboard" }, 500);
    }

    const leaderboard =
      streakData?.map((student: any, index: number) => ({
        rank: index + 1,
        studentId: student.id,
        user: student.user,
        streakDays: student.streakDays,
        lastLogin: student.lastLogin,
      })) || [];

    return c.json(leaderboard, 200);
  } catch (error) {
    console.error("Error in getStreakLeaderboard:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getStreakStats = async (c: Context<{ Bindings: Env }>) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("classId")
      .eq("userId", userId)
      .single();

    if (studentError || !student) {
      return c.json({ error: "Student not found" }, 404);
    }

    const { data: classStats, error: classStatsError } = await supabase(c)
      .from("Student")
      .select("streakDays, userId")
      .eq("classId", student.classId);

    if (classStatsError) {
      console.error("Error fetching class stats:", classStatsError);
      return c.json({ error: "Failed to fetch class statistics" }, 500);
    }

    const streaks = classStats?.map((s: any) => s.streakDays) || [];
    const totalStudents = streaks.length;
    const averageStreak =
      totalStudents > 0
        ? Math.round(
            streaks.reduce((sum: any, streak: any) => sum + streak, 0) /
              totalStudents
          )
        : 0;
    const maxStreak = totalStudents > 0 ? Math.max(...streaks) : 0;
    const studentsWithActiveStreaks = streaks.filter(
      (streak: any) => streak > 0
    ).length;

    const today = new Date().toISOString().split("T")[0];
    const { data: todayLogins, error: todayError } = await supabase(c)
      .from("LoginStreak")
      .select("userId")
      .eq("loginDate", today)
      .in("userId", classStats?.map((s: any) => s.userId) || []);

    const todayLoginCount = todayLogins?.length || 0;

    return c.json({
      totalStudents,
      averageStreak,
      maxStreak,
      studentsWithActiveStreaks,
      todayLoginCount,
      activeStreakPercentage:
        totalStudents > 0
          ? Math.round((studentsWithActiveStreaks / totalStudents) * 100)
          : 0,
    });
  } catch (error) {
    console.error("Error in getStreakStats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getLoginHistory = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { period = "month" } = c.req.query();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    let startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const { data: loginHistory, error: historyError } = await supabase(c)
      .from("LoginStreak")
      .select("loginDate, consecutive")
      .eq("userId", userId)
      .gte("loginDate", startDate.toISOString().split("T")[0])
      .order("loginDate", { ascending: true });

    if (historyError) {
      console.error("Error fetching login history:", historyError);
      return c.json({ error: "Failed to fetch login history" }, 500);
    }

    return c.json({
      period,
      startDate: startDate.toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      loginHistory: loginHistory || [],
      totalLogins: loginHistory?.length || 0,
      consecutiveLogins:
        loginHistory?.filter((login: any) => login.consecutive).length || 0,
    });
  } catch (error) {
    console.error("Error in getLoginHistory:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
