import { Hono } from "hono";
import {
  getAssignmentsByClass,
  getAssignmentById,
  getAssignmentsByTeacher,
  createAssignment,
  getAssignmentWithSubmissions,
  updateAssignment,
  deleteAssignment,
} from "../controller/AssignmentController";
import { requireAuth, requireTeacher } from "../middleware/requireAuth";

const router = new Hono();

router.post("/", requireTeacher, createAssignment);
router.get("/class/:classId", requireAuth, getAssignmentsByClass);
router.get("/:assignmentId/details", requireAuth, getAssignmentWithSubmissions);
router.get("/:assignmentId", requireAuth, getAssignmentById);
router.put("/:assignmentId", requireTeacher, updateAssignment);
router.delete("/:assignmentId", requireTeacher, deleteAssignment);
router.get("/teacher/my-assignments", requireTeacher, getAssignmentsByTeacher);

export default router;
