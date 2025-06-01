import { Hono } from "hono";
import {
  getStudentById,
  getStudentSubmissions,
  getStudentStreaks,
  getCurrentStudent,
} from "../controller/StudentController";

const router = new Hono();

router.get("/me", getCurrentStudent);
router.get("/:studentId", getStudentById);
router.get("/:studentId/submissions", getStudentSubmissions);
router.get("/:studentId/streaks", getStudentStreaks);

export default router;
