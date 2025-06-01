import type { Context } from "hono";
import type { Assignment } from "../types";
import { supabase } from "../utils/supabase";
import { getUserIdFromToken } from "../utils/auth";
import type { Env } from "..";

interface CreateAssignmentRequest {
  title: string;
  description?: string;
  dueDate: string;
  teacherId: string;
  classIds?: number[];
}

interface UpdateAssignmentRequest {
  title: string;
  description?: string;
  dueDate: string;
  classIds?: number[];
}

interface AssignmentWithTeacher extends Assignment {
  teacher: {
    id: string;
    user: {
      fullName: string;
      username: string;
    };
  };
}

interface AssignmentWithClasses extends Assignment {
  assignmentClasses: {
    classId: string;
    class: {
      name: string;
    };
  }[];
}

interface SubmissionWithStudentData {
  id: string;
  content: string;
  submittedAt: string;
  aiFeedback?: string;
  aiScore?: number;
  feedbackGeneratedAt?: string;
  studentId: string;
  student: {
    id: string;
    user: {
      username: string;
      fullName: string;
    };
    classId: string;
  };
}

interface AssignmentWithSubmissionsResponse {
  assignment: AssignmentWithTeacher & {
    classes: {
      classId: string;
      class: {
        id: string;
        name: string;
      };
    }[];
  };
  submissions: SubmissionWithStudentData[];
  totalStudents: number;
}

export const createAssignment = async (c: Context<{ Bindings: Env }>) => {
  try {
    const {
      title,
      description,
      dueDate,
      teacherId,
      classIds,
    }: CreateAssignmentRequest = await c.req.json();

    if (!title || !dueDate || !teacherId) {
      return c.json(
        {
          error:
            "Missing required fields: title, dueDate, and teacherId are required",
        },
        400
      );
    }

    console.log("Creating assignment with data:", {
      title,
      description,
      dueDate,
      teacherId,
      classIds,
    });

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .insert({ title, description, dueDate, teacherId })
      .select()
      .single();

    if (assignmentError || !assignment) {
      console.error("Error creating assignment:", assignmentError);
      return c.json({ error: "Failed to create assignment" }, 500);
    }

    console.log("Assignment created successfully:", assignment);

    if (classIds && classIds.length > 0) {
      const { data: assignmentClasses, error: assignmentClassError } =
        await supabase(c)
          .from("AssignmentClass")
          .insert(
            classIds.map((classId: number) => ({
              assignmentId: assignment.id,
              classId,
            }))
          );

      if (assignmentClassError) {
        console.error(
          "Error creating assignment-class associations:",
          assignmentClassError
        );
        console.warn("Assignment created but class associations failed");
      } else {
        console.log(
          "Assignment-class associations created:",
          assignmentClasses
        );
      }
    }

    return c.json(assignment as Assignment, 201);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAssignmentsByClass = async (c: Context<{ Bindings: Env }>) => {
  try {
    const classId: string = c.req.param("classId");
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: student } = await supabase(c)
      .from("Student")
      .select("id, classId")
      .eq("userId", userId)
      .eq("classId", classId)
      .single();

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (!student && !teacher) {
      return c.json(
        { error: "Access denied: Not authorized for this class" },
        403
      );
    }

    const { data: assignmentClasses, error: assignmentClassError } =
      await supabase(c)
        .from("AssignmentClass")
        .select(
          `
        assignmentId,
        assignment:Assignment(
          *,
          teacher:Teacher(
            id,
            user:User(fullName, username)
          )
        )
      `
        )
        .eq("classId", classId);

    if (assignmentClassError) {
      console.error("Error fetching assignment classes:", assignmentClassError);
      return c.json({ error: "Failed to fetch assignments" }, 500);
    }

    const assignments: AssignmentWithTeacher[] = assignmentClasses.map(
      (ac: any) => ({
        ...ac.assignment,
        teacher: ac.assignment?.teacher,
      })
    );

    return c.json(assignments, 200);
  } catch (error) {
    console.error("Error fetching assignments by class:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAssignmentById = async (c: Context<{ Bindings: Env }>) => {
  try {
    const assignmentId: string = c.req.param("assignmentId");
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .select(
        `
        *,
        teacher:Teacher(
          id,
          user:User(fullName, username)
        )
      `
      )
      .eq("id", assignmentId)
      .single();

    if (assignmentError) {
      console.error("Error fetching assignment:", assignmentError);
      return c.json({ error: "Assignment not found" }, 404);
    }

    const { data: assignmentClasses } = await supabase(c)
      .from("AssignmentClass")
      .select("classId")
      .eq("assignmentId", assignmentId);

    if (assignmentClasses && assignmentClasses.length > 0) {
      const classIds = assignmentClasses.map((ac) => ac.classId);

      const { data: studentAccess } = await supabase(c)
        .from("Student")
        .select("id")
        .eq("userId", userId)
        .in("classId", classIds);

      const { data: teacherAccess } = await supabase(c)
        .from("Teacher")
        .select("id")
        .eq("userId", userId)
        .eq("id", assignment.teacherId);

      if (!studentAccess?.length && !teacherAccess?.length) {
        return c.json(
          { error: "Access denied: Not authorized for this assignment" },
          403
        );
      }
    }

    return c.json(assignment as AssignmentWithTeacher, 200);
  } catch (error) {
    console.error("Error fetching assignment by ID:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAssignmentsByTeacher = async (
  c: Context<{ Bindings: Env }>
) => {
  try {
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    const { data: teacher, error: teacherError } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (teacherError || !teacher) {
      return c.json({ error: "Access denied: Teacher account required" }, 403);
    }

    const { data: assignments, error: assignmentsError } = await supabase(c)
      .from("Assignment")
      .select(
        `
        *,
        assignmentClasses:AssignmentClass(
          classId,
          class:Class(name)
        )
      `
      )
      .eq("teacherId", teacher.id)
      .order("createdAt", { ascending: false });

    if (assignmentsError) {
      console.error("Error fetching teacher assignments:", assignmentsError);
      return c.json({ error: "Failed to fetch assignments" }, 500);
    }

    return c.json(assignments as AssignmentWithClasses[], 200);
  } catch (error) {
    console.error("Error fetching assignments by teacher:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getAssignmentWithSubmissions = async (
  c: Context<{ Bindings: Env }>
) => {
  try {
    const assignmentId: string = c.req.param("assignmentId");
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    console.log(
      "Fetching assignment details for assignment:",
      assignmentId,
      "user:",
      userId
    );

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .select(
        `
        *,
        teacher:Teacher(
          id,
          user:User(fullName, username)
        )
      `
      )
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      console.error("Error fetching assignment:", assignmentError);
      return c.json({ error: "Assignment not found" }, 404);
    }

    console.log("Assignment found:", assignment);

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .eq("id", assignment.teacherId)
      .single();

    if (!teacher) {
      return c.json({ error: "Access denied: Not your assignment" }, 403);
    }

    console.log("User authorized as teacher:", teacher.id);

    const { data: assignmentClasses } = await supabase(c)
      .from("AssignmentClass")
      .select(
        `
        classId,
        class:Class(
          id,
          name
        )
      `
      )
      .eq("assignmentId", assignmentId);

    console.log("Assignment classes:", assignmentClasses);

    const { data: submissions, error: submissionsError } = await supabase(c)
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
          user:User(username, fullName),
          classId
        )
      `
      )
      .eq("assignmentId", assignmentId)
      .order("submittedAt", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
    }

    console.log("Submissions found:", submissions?.length || 0);

    let totalStudents = 0;
    if (assignmentClasses && assignmentClasses.length > 0) {
      const classIds = assignmentClasses.map((ac) => ac.classId);

      const { count: studentsCount, error: studentsCountError } =
        await supabase(c)
          .from("Student")
          .select("*", { count: "exact", head: true })
          .in("classId", classIds);

      if (!studentsCountError) {
        totalStudents = studentsCount || 0;
      }
    }

    const response: AssignmentWithSubmissionsResponse = {
      assignment: {
        ...assignment,
        classes: assignmentClasses || [],
      },
      submissions: (submissions ||
        []) as unknown as SubmissionWithStudentData[],
      totalStudents,
    };

    return c.json(response, 200);
  } catch (error) {
    console.error("Error in getAssignmentWithSubmissions:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const updateAssignment = async (c: Context<{ Bindings: Env }>) => {
  try {
    const assignmentId: string = c.req.param("assignmentId");
    const { title, description, dueDate, classIds }: UpdateAssignmentRequest =
      await c.req.json();
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    console.log("Updating assignment:", assignmentId, "by user:", userId);

    if (!title || !dueDate) {
      return c.json(
        {
          error: "Missing required fields: title and dueDate are required",
        },
        400
      );
    }

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .select("id, teacherId")
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .eq("id", assignment.teacherId)
      .single();

    if (!teacher) {
      return c.json({ error: "Access denied: Not your assignment" }, 403);
    }

    const { data: updatedAssignment, error: updateError } = await supabase(c)
      .from("Assignment")
      .update({
        title,
        description: description || null,
        dueDate,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating assignment:", updateError);
      return c.json({ error: "Failed to update assignment" }, 500);
    }

    if (classIds && Array.isArray(classIds)) {
      await supabase(c)
        .from("AssignmentClass")
        .delete()
        .eq("assignmentId", assignmentId);

      if (classIds.length > 0) {
        const { error: assignmentClassError } = await supabase(c)
          .from("AssignmentClass")
          .insert(
            classIds.map((classId: number) => ({
              assignmentId: parseInt(assignmentId),
              classId,
            }))
          );

        if (assignmentClassError) {
          console.error(
            "Error updating assignment classes:",
            assignmentClassError
          );
        }
      }
    }

    console.log("Assignment updated successfully:", updatedAssignment);
    return c.json(updatedAssignment as Assignment, 200);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const deleteAssignment = async (c: Context<{ Bindings: Env }>) => {
  try {
    const assignmentId: string = c.req.param("assignmentId");
    const userId: string | null = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    console.log("Deleting assignment:", assignmentId, "by user:", userId);

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .select("id, teacherId")
      .eq("id", assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const { data: teacher } = await supabase(c)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .eq("id", assignment.teacherId)
      .single();

    if (!teacher) {
      return c.json({ error: "Access denied: Not your assignment" }, 403);
    }

    await supabase(c)
      .from("AssignmentClass")
      .delete()
      .eq("assignmentId", assignmentId);

    await supabase(c)
      .from("Submission")
      .delete()
      .eq("assignmentId", assignmentId);

    const { error: deleteError } = await supabase(c)
      .from("Assignment")
      .delete()
      .eq("id", assignmentId);

    if (deleteError) {
      console.error("Error deleting assignment:", deleteError);
      return c.json({ error: "Failed to delete assignment" }, 500);
    }

    console.log("Assignment deleted successfully");
    return c.json({ message: "Assignment deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
