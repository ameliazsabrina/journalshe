import { Hono } from "hono";
import {
  registerStudent,
  registerTeacher,
  registerAdmin,
  login,
  logout,
  profile,
} from "../controller/AuthController";

const router = new Hono();

router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);
router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.get("/profile", profile);
router.post("/logout", logout);

export default router;
