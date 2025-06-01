import { Hono } from "hono";
import {
  getCurrentTeacher,
  getTeacherById,
  getTeacherAssignments,
  getAssignmentWithSubmissions,
  getTeacherStats,
  getTeacherClasses,
  getCurrentTeacherClasses,
  editTeacherClass,
  deleteTeacherClass,
  getSchoolClasses,
} from "../controller/TeacherController";

const router = new Hono();

router.get("/me", getCurrentTeacher);
router.get("/:teacherId", getTeacherById);
router.get("/me/assignments", getTeacherAssignments);
router.get("/assignments/:assignmentId", getAssignmentWithSubmissions);
router.get("/me/stats", getTeacherStats);
router.get("/me/classes", getCurrentTeacherClasses);
router.get("/me/school-classes", getSchoolClasses);
router.get("/:teacherId/classes", getTeacherClasses);
router.put("/me/classes", editTeacherClass);
router.delete("/me/classes/:classId", deleteTeacherClass);

export default router;
