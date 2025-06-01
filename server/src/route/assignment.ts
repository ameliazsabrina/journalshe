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

const router = new Hono();

router.post("/", createAssignment);
router.get("/class/:classId", getAssignmentsByClass);
router.get("/:assignmentId/details", getAssignmentWithSubmissions);
router.get("/:assignmentId", getAssignmentById);
router.put("/:assignmentId", updateAssignment);
router.delete("/:assignmentId", deleteAssignment);
router.get("/teacher/my-assignments", getAssignmentsByTeacher);

export default router;
