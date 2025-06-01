import OpenAI from "openai";
import * as dotenv from "dotenv";
import { Context } from "hono";

dotenv.config();

type Env = {
  OPENAI_API_KEY: string;
};

export const openai = (c: Context<{ Bindings: Env }>) => {
  const apiKey = c.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  return new OpenAI({
    apiKey: apiKey,
  });
};

interface GradingResult {
  score: number;
  feedback: string;
}

export const gradeSubmission = async (
  c: Context<{ Bindings: Env }>,
  content: string,
  assignmentTitle: string,
  assignmentDescription?: string
): Promise<GradingResult> => {
  try {
    const prompt = `
You are an experienced English teacher grading a student submission. Please evaluate the following submission and provide:

1. A score from 0-100
2. Detailed, constructive feedback

Assignment: ${assignmentTitle}
${assignmentDescription ? `Description: ${assignmentDescription}` : ""}

Student Submission:
"${content}"

Evaluation Criteria:
- Content relevance and understanding (25%)
- Writing clarity and organization (25%)
- Grammar and mechanics (25%)
- Depth of analysis/creativity (25%)

Please respond in the following JSON format:
{
  "score": [number between 0-100],
  "feedback": "[detailed constructive feedback explaining the score and providing specific suggestions for improvement]"
}

Make your feedback encouraging yet honest, highlighting both strengths and areas for improvement.
`;

    const completion = await openai(c).chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful English teacher who provides constructive feedback on student writing. Always respond with valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const gradingResult = JSON.parse(response.trim());

    if (
      typeof gradingResult.score !== "number" ||
      typeof gradingResult.feedback !== "string"
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    const score = Math.max(0, Math.min(100, Math.round(gradingResult.score)));

    return {
      score,
      feedback: gradingResult.feedback,
    };
  } catch (error) {
    console.error("Error grading submission with OpenAI:", error);

    return fallbackGrading(content, assignmentTitle);
  }
};

const fallbackGrading = (
  content: string,
  assignmentTitle: string
): GradingResult => {
  const wordCount = content.trim().split(/\s+/).length;
  let score = 70;
  let feedback = "";

  if (wordCount >= 200) score += 15;
  else if (wordCount >= 100) score += 10;
  else if (wordCount >= 50) score += 5;

  if (content.includes(".") && content.includes(",")) score += 5;
  if (content.split(".").length > 3) score += 5;
  if (/[A-Z]/.test(content) && /[a-z]/.test(content)) score += 5;

  score = Math.min(100, score);

  if (assignmentTitle.toLowerCase().includes("essay")) {
    feedback = `Your essay demonstrates understanding of the topic. ${
      wordCount >= 200
        ? "You've met the length requirement well."
        : "Consider expanding your analysis with more examples."
    } ${
      score > 85
        ? "Excellent work on structure and analysis!"
        : score > 70
        ? "Good effort! Consider adding more specific examples and deeper analysis."
        : "You've made a good start. Try to develop your arguments more thoroughly."
    }`;
  } else if (assignmentTitle.toLowerCase().includes("creative")) {
    feedback = `Your creative piece shows imagination and effort. ${
      content.includes('"')
        ? "Good use of dialogue!"
        : "Consider adding dialogue to bring characters to life."
    } ${
      score > 85
        ? "Excellent character development and narrative flow!"
        : score > 70
        ? "Nice creative approach! Consider adding more descriptive details."
        : "Creative start! Try to develop the scene and characters more fully."
    }`;
  } else {
    feedback = `Your submission shows good effort and understanding. ${
      score > 85
        ? "Excellent work - clear, well-organized, and thoughtful!"
        : score > 70
        ? "Good job! Consider adding more detail to strengthen your response."
        : "You're on the right track. Try to expand your ideas with more examples."
    }`;
  }

  return { score, feedback };
};
