import { Hono } from "hono";
import {
  createSubmission,
  getSubmissionById,
  regenerateAIFeedback,
} from "../controller/SubmissionController";

const router = new Hono();

router.post("/", createSubmission);
router.get("/:submissionId", getSubmissionById);
router.post("/:submissionId/regenerate-feedback", regenerateAIFeedback);

export default router;
