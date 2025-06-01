import { Context } from "hono";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import { TeacherProfile } from "../types";

export const getCurrentTeacher = async (c: Context) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select(
        `
        id,
        schoolId,
        school:School(
          id,
          name,
          address
        ),
        user:User(
          id,
          username,
          fullName,
          email,
          role:Role(name)
        )
      `
      )
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from("TeacherClass")
      .select(
        `
        classId,
        class:Class(
          id,
          name
        )
      `
      )
      .eq("teacherId", teacher.id);

    if (teacherClassesError) {
      console.error("Error fetching teacher classes:", teacherClassesError);
    }

    const userProfile: TeacherProfile = {
      id: (teacher.user as any).id,
      username: (teacher.user as any).username,
      fullName: (teacher.user as any).fullName,
      email: (teacher.user as any).email,
      role: (teacher.user as any).role?.name || "Teacher",
      school: teacher.school
        ? {
            id: (teacher.school as any).id,
            name: (teacher.school as any).name,
            address: (teacher.school as any).address,
          }
        : undefined,
      classes:
        teacherClasses?.map((tc) => ({
          id: tc.classId,
          name: (tc.class as any)?.name || `Class ${tc.classId}`,
        })) || [],
    };

    return c.json({ user: userProfile }, 200);
  } catch (error) {
    console.error("Error fetching current teacher:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getTeacherById = async (c: Context) => {
  try {
    const teacherId = c.req.param("teacherId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select(
        `
        id,
        school:School(
          id,
          name
        ),
        user:User(
          id,
          username,
          fullName,
          email
        )
      `
      )
      .eq("id", teacherId)
      .single();

    const { data: teacherClasses } = await supabase
      .from("TeacherClass")
      .select("classId")
      .eq("teacherId", teacherId);

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    return c.json({ teacher, teacherClasses }, 200);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getTeacherAssignments = async (c: Context) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from("Assignment")
      .select(
        `
        id,
        title,
        description,
        dueDate,
        createdAt,
        teacherId
      `
      )
      .eq("teacherId", teacher.id)
      .order("createdAt", { ascending: false });

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      return c.json({ error: "Failed to fetch assignments" }, 500);
    }

    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const { count: submissionCount, error: submissionCountError } =
          await supabase
            .from("Submission")
            .select("*", { count: "exact", head: true })
            .eq("assignmentId", assignment.id);

        if (submissionCountError) {
          console.error("Error counting submissions:", submissionCountError);
        }

        const { data: submissions, error: submissionsError } = await supabase
          .from("Submission")
          .select("studentId")
          .eq("assignmentId", assignment.id);

        const { data: assignmentClasses, error: assignmentClassesError } =
          await supabase
            .from("AssignmentClass")
            .select("classId")
            .eq("assignmentId", assignment.id);

        let totalStudents = 0;
        if (
          !assignmentClassesError &&
          assignmentClasses &&
          assignmentClasses.length > 0
        ) {
          const classIds = assignmentClasses.map((ac) => ac.classId);

          const { count: studentsCount, error: studentsCountError } =
            await supabase
              .from("Student")
              .select("*", { count: "exact", head: true })
              .in("classId", classIds);

          if (!studentsCountError) {
            totalStudents = studentsCount || 0;
          }
        } else {
          const { data: teacherClasses, error: teacherClassesError } =
            await supabase
              .from("TeacherClass")
              .select("classId")
              .eq("teacherId", teacher.id);

          if (
            !teacherClassesError &&
            teacherClasses &&
            teacherClasses.length > 0
          ) {
            const classIds = teacherClasses.map((tc) => tc.classId);

            const { count: studentsCount, error: studentsCountError } =
              await supabase
                .from("Student")
                .select("*", { count: "exact", head: true })
                .in("classId", classIds);

            if (!studentsCountError) {
              totalStudents = studentsCount || 0;
            }
          }
        }

        return {
          ...assignment,
          submissionCount: submissionCount || 0,
          totalStudents,
          pointsPossible: 100,
        };
      })
    );

    return c.json(assignmentsWithStats, 200);
  } catch (error) {
    console.error("Error in getTeacherAssignments:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAssignmentWithSubmissions = async (c: Context) => {
  try {
    const assignmentId = c.req.param("assignmentId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("Assignment")
      .select(
        `
        id,
        title,
        description,
        dueDate,
        createdAt,
        teacherId
      `
      )
      .eq("id", assignmentId)
      .eq("teacherId", teacher.id)
      .single();

    if (assignmentError || !assignment) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from("Submission")
      .select(
        `
        id,
        content,
        submittedAt,
        aiFeedback,
        aiScore,
        feedbackGeneratedAt,
        studentId,
        student:Student(
          id,
          user:User(username, fullName)
        )
      `
      )
      .eq("assignmentId", assignmentId)
      .order("submittedAt", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return c.json({ error: "Failed to fetch submissions" }, 500);
    }

    return c.json({
      assignment,
      submissions: submissions || [],
      submissionCount: submissions?.length || 0,
    });
  } catch (error) {
    console.error("Error in getAssignmentWithSubmissions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getTeacherStats = async (c: Context) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { count: assignmentsCount, error: assignmentsCountError } =
      await supabase
        .from("Assignment")
        .select("*", { count: "exact", head: true })
        .eq("teacherId", teacher.id);

    const { data: teacherAssignments, error: teacherAssignmentsError } =
      await supabase
        .from("Assignment")
        .select("id")
        .eq("teacherId", teacher.id);

    let totalSubmissions = 0;
    if (!teacherAssignmentsError && teacherAssignments) {
      const assignmentIds = teacherAssignments.map((a) => a.id);
      if (assignmentIds.length > 0) {
        const { count: submissionsCount, error: submissionsCountError } =
          await supabase
            .from("Submission")
            .select("*", { count: "exact", head: true })
            .in("assignmentId", assignmentIds);

        if (!submissionsCountError) {
          totalSubmissions = submissionsCount || 0;
        }
      }
    }

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { count: dueSoonCount, error: dueSoonError } = await supabase
      .from("Assignment")
      .select("*", { count: "exact", head: true })
      .eq("teacherId", teacher.id)
      .lte("dueDate", threeDaysFromNow.toISOString())
      .gte("dueDate", new Date().toISOString());

    return c.json({
      totalAssignments: assignmentsCount || 0,
      totalSubmissions,
      assignmentsDueSoon: dueSoonCount || 0,
      averageCompletionRate:
        totalSubmissions > 0
          ? Math.round((totalSubmissions / (assignmentsCount || 1)) * 100)
          : 0,
    });
  } catch (error) {
    console.error("Error in getTeacherStats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getTeacherClasses = async (c: Context) => {
  try {
    const teacherId = c.req.param("teacherId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from("TeacherClass")
      .select(
        `
        classId,
        class:Class(
          id,
          name
        )
      `
      )
      .eq("teacherId", teacherId);

    if (teacherClassesError) {
      console.error("Error fetching teacher classes:", teacherClassesError);
      return c.json({ error: "Failed to fetch teacher classes" }, 500);
    }

    const classes =
      teacherClasses?.map((tc) => ({
        id: tc.classId,
        name: (tc.class as any)?.name || `Class ${tc.classId}`,
      })) || [];

    return c.json(classes, 200);
  } catch (error) {
    console.error("Error in getTeacherClasses:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getCurrentTeacherClasses = async (c: Context) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from("TeacherClass")
      .select(
        `
        classId,
        class:Class(
          id,
          name
        )
      `
      )
      .eq("teacherId", teacher.id);

    if (teacherClassesError) {
      console.error("Error fetching teacher classes:", teacherClassesError);
      return c.json({ error: "Failed to fetch teacher classes" }, 500);
    }

    const classes =
      teacherClasses?.map((tc) => ({
        id: tc.classId,
        name: (tc.class as any)?.name || `Class ${tc.classId}`,
      })) || [];

    return c.json(classes, 200);
  } catch (error) {
    console.error("Error in getCurrentTeacherClasses:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const editTeacherClass = async (c: Context) => {
  try {
    const { classIds } = await c.req.json();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { error: deleteError } = await supabase
      .from("TeacherClass")
      .delete()
      .eq("teacherId", teacher.id);

    if (deleteError) {
      console.error("Error deleting existing teacher classes:", deleteError);
      return c.json({ error: "Failed to update teacher classes" }, 500);
    }

    if (classIds && classIds.length > 0) {
      const teacherClassInserts = classIds.map((classId: number) => ({
        teacherId: teacher.id,
        classId: classId,
      }));

      const { error: insertError } = await supabase
        .from("TeacherClass")
        .insert(teacherClassInserts);

      if (insertError) {
        console.error("Error inserting teacher classes:", insertError);
        return c.json({ error: "Failed to update teacher classes" }, 500);
      }
    }

    return c.json({ message: "Teacher classes updated successfully" }, 200);
  } catch (error) {
    console.error("Error in editTeacherClass:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deleteTeacherClass = async (c: Context) => {
  try {
    const classId = c.req.param("classId");
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    const { error: deleteError } = await supabase
      .from("TeacherClass")
      .delete()
      .eq("teacherId", teacher.id)
      .eq("classId", classId);

    if (deleteError) {
      console.error("Error deleting teacher class:", deleteError);
      return c.json({ error: "Failed to delete teacher class" }, 500);
    }

    return c.json({ message: "Teacher class deleted successfully" }, 200);
  } catch (error) {
    console.error("Error in deleteTeacherClass:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getSchoolClasses = async (c: Context) => {
  try {
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("Teacher")
      .select(
        `
        id,
        schoolId,
        school:School(
          id,
          name,
          address
        )
      `
      )
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Teacher not found" }, 404);
    }

    if (!teacher.schoolId) {
      return c.json({ classes: [], school: null }, 200);
    }

    const { data: schoolClasses, error: schoolClassesError } = await supabase
      .from("Class")
      .select("id, name")
      .eq("schoolId", teacher.schoolId)
      .order("name");

    if (schoolClassesError) {
      console.error("Error fetching school classes:", schoolClassesError);
      return c.json({ error: "Failed to fetch school classes" }, 500);
    }

    const { data: teacherClasses, error: teacherClassesError } = await supabase
      .from("TeacherClass")
      .select("classId")
      .eq("teacherId", teacher.id);

    if (teacherClassesError) {
      console.error("Error fetching teacher classes:", teacherClassesError);
    }

    const assignedClassIds = teacherClasses?.map((tc) => tc.classId) || [];

    return c.json({
      classes: schoolClasses || [],
      assignedClassIds,
      school: teacher.school,
    });
  } catch (error) {
    console.error("Error in getSchoolClasses:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
