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
import { requireAuth, requireTeacher } from "../middleware/requireAuth";

const router = new Hono();

router.get("/me", requireTeacher, getCurrentTeacher);
router.get("/:teacherId", requireAuth, getTeacherById);
router.get("/me/assignments", requireTeacher, getTeacherAssignments);
router.get(
  "/assignments/:assignmentId",
  requireAuth,
  getAssignmentWithSubmissions
);
router.get("/me/stats", requireTeacher, getTeacherStats);
router.get("/me/classes", requireTeacher, getCurrentTeacherClasses);
router.get("/me/school-classes", requireTeacher, getSchoolClasses);
router.get("/:teacherId/classes", requireAuth, getTeacherClasses);
router.put("/me/classes", requireTeacher, editTeacherClass);
router.delete("/me/classes/:classId", requireTeacher, deleteTeacherClass);

export default router;
