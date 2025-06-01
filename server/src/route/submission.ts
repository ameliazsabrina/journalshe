import { Hono } from "hono";
import {
  createSubmission,
  getSubmissionById,
  regenerateAIFeedback,
} from "../controller/SubmissionController";
import { requireAuth } from "../middleware/requireAuth";

const router = new Hono();

router.post("/", requireAuth, createSubmission);
router.get("/:submissionId", requireAuth, getSubmissionById);
router.post(
  "/:submissionId/regenerate-feedback",
  requireAuth,
  regenerateAIFeedback
);

export default router;
