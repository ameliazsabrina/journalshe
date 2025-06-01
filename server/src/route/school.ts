import { Hono } from "hono";
import {
  createSchool,
  createClass,
  listSchools,
  listClasses,
} from "../controller/SchoolController";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = new Hono();

router.post("/school", requireAdmin, createSchool);
router.post("/class", requireAdmin, createClass);
router.get("/school", requireAuth, listSchools);
router.get("/class", requireAuth, listClasses);

export default router;
