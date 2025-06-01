import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import { gradeSubmission } from "../utils/OpenAI";
import { getUserIdFromToken } from "../utils/auth";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

export const createSubmission = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { content, assignmentId, studentId } = await c.req.json();
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    if (!content || !assignmentId || !studentId) {
      return c.json(
        { error: "Content, assignmentId, and studentId are required" },
        400
      );
    }

    const { data: student, error: studentError } = await supabase(c)
      .from("Student")
      .select("userId")
      .eq("id", studentId)
      .single();

    if (studentError || student.userId !== userId) {
      return c.json({ error: "Access denied: Invalid student ID" }, 403);
    }

    const { data: assignment, error: assignmentError } = await supabase(c)
      .from("Assignment")
      .select("id, title, description")
      .eq("id", assignmentId)
      .single();

    if (assignmentError) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const { data: existingSubmission } = await supabase(c)
      .from("Submission")
      .select("id")
      .eq("studentId", studentId)
      .eq("assignmentId", assignmentId)
      .single();

    if (existingSubmission) {
      return c.json(
        { error: "You have already submitted this assignment" },
        400
      );
    }

    const { data: newSubmission, error: submissionError } = await supabase(c)
      .from("Submission")
      .insert([
        {
          content: content,
          studentId: studentId,
          assignmentId: assignmentId,
          submittedAt: new Date().toISOString(),
          aiFeedback: null,
          aiScore: null,
          feedbackGeneratedAt: null,
        },
      ])
      .select()
      .single();

    if (submissionError) {
      console.error("Error creating submission:", submissionError);
      return c.json({ error: "Failed to create submission" }, 500);
    }

    await generateAIFeedback(
      c,
      newSubmission.id,
      content,
      assignment.title,
      assignment.description
    );

    return c.json(
      {
        message: "Submission created successfully",
        submission: newSubmission,
      },
      201
    );
  } catch (error) {
    console.error("Error creating submission:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

const generateAIFeedback = async (
  c: Context<{ Bindings: Env }>,
  submissionId: number,
  content: string,
  assignmentTitle: string,
  assignmentDescription?: string
) => {
  try {
    console.log(`Generating AI feedback for submission ${submissionId}...`);

    const { score, feedback } = await gradeSubmission(
      c as any,
      content,
      assignmentTitle,
      assignmentDescription
    );

    const { error: updateError } = await supabase(c)
      .from("Submission")
      .update({
        aiFeedback: feedback,
        aiScore: score,
        feedbackGeneratedAt: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Error updating submission with AI feedback:", updateError);
      return;
    }

    console.log(
      `AI feedback generated successfully for submission ${submissionId}. Score: ${score}`
    );

    await awardPointsForSubmission(c as any, submissionId, score);
  } catch (error) {
    console.error("Error generating AI feedback:", error);

    await supabase(c)
      .from("Submission")
      .update({
        aiFeedback:
          "Unable to generate AI feedback at this time. Please contact your teacher for manual grading.",
        aiScore: null,
        feedbackGeneratedAt: new Date().toISOString(),
      })
      .eq("id", submissionId);
  }
};

const awardPointsForSubmission = async (
  c: Context<{ Bindings: Env }>,
  submissionId: number,
  aiScore: number
) => {
  try {
    const { data: submission, error: submissionError } = await supabase(c)
      .from("Submission")
      .select(
        `
        studentId,
        student:Student(
          classId
        )
      `
      )
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      console.error(
        "Error fetching submission for points award:",
        submissionError
      );
      return;
    }

    let points = Math.max(0, Math.round(aiScore));

    console.log(
      `Calculating points for submission ${submissionId}: AI Score: ${aiScore}, Total Points: ${points}`
    );

    const { error: pointsError } = await supabase(c as any)
      .from("ClassLeaderboard")
      .insert([
        {
          studentId: submission.studentId,
          classId: (submission.student as any).classId,
          points: points,
          updated: new Date().toISOString(),
        },
      ]);

    if (pointsError) {
      console.error("Error awarding points:", pointsError);
    } else {
      console.log(
        `Awarded ${points} points to student ${submission.studentId} for submission ${submissionId} (AI Score: ${aiScore})`
      );
    }
  } catch (error) {
    console.error("Error in awardPointsForSubmission:", error);
  }
};

export const getSubmissionById = async (c: Context<{ Bindings: Env }>) => {
  try {
    const submissionId = parseInt(c.req.param("submissionId"));
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    if (isNaN(submissionId)) {
      return c.json({ error: "Invalid submission ID" }, 400);
    }

    const { data: submission, error: submissionError } = await supabase(
      c as any
    )
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
        assignmentId,
        student:Student(
          id,
          user:User(username, fullName)
        ),
        assignment:Assignment(
          id,
          title,
          description,
          dueDate
        )
      `
      )
      .eq("id", submissionId)
      .single();

    if (submissionError) {
      return c.json({ error: "Submission not found" }, 404);
    }

    const { data: student } = await supabase(c as any)
      .from("Student")
      .select("userId")
      .eq("id", submission.studentId)
      .single();

    const { data: teacher } = await supabase(c as any)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (student?.userId !== userId && !teacher) {
      return c.json({ error: "Access denied" }, 403);
    }

    return c.json(submission, 200);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const regenerateAIFeedback = async (c: Context<{ Bindings: Env }>) => {
  try {
    const submissionId = parseInt(c.req.param("submissionId"));
    const userId = getUserIdFromToken(c);

    if (!userId) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }

    if (isNaN(submissionId)) {
      return c.json({ error: "Invalid submission ID" }, 400);
    }

    const { data: submission, error: submissionError } = await supabase(
      c as any
    )
      .from("Submission")
      .select(
        `
        id,
        content,
        studentId,
        assignment:Assignment(title, description)
      `
      )
      .eq("id", submissionId)
      .single();

    if (submissionError) {
      return c.json({ error: "Submission not found" }, 404);
    }

    const { data: student } = await supabase(c as any)
      .from("Student")
      .select("userId")
      .eq("id", submission.studentId)
      .single();

    const { data: teacher } = await supabase(c as any)
      .from("Teacher")
      .select("id")
      .eq("userId", userId)
      .single();

    if (student?.userId !== userId && !teacher) {
      return c.json({ error: "Access denied" }, 403);
    }

    await generateAIFeedback(
      c,
      submission.id,
      submission.content,
      (submission.assignment as any).title,
      (submission.assignment as any).description
    );

    return c.json(
      {
        message: "AI feedback regeneration initiated",
        submissionId: submission.id,
      },
      200
    );
  } catch (error) {
    console.error("Error regenerating AI feedback:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
