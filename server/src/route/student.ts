import { Hono } from "hono";
import {
  getStudentById,
  getStudentSubmissions,
  getStudentStreaks,
  getCurrentStudent,
} from "../controller/StudentController";
import { requireAuth } from "../middleware/requireAuth";

const router = new Hono();

router.get("/me", requireAuth, getCurrentStudent);
router.get("/:studentId", requireAuth, getStudentById);
router.get("/:studentId/submissions", requireAuth, getStudentSubmissions);
router.get("/:studentId/streaks", requireAuth, getStudentStreaks);

export default router;
