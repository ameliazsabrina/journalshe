import { Hono } from "hono";
import {
  createSchool,
  createClass,
  listSchools,
  listClasses,
} from "../controller/SchoolController";

const router = new Hono();

router.post("/school", createSchool);
router.post("/class", createClass);
router.get("/school", listSchools);
router.get("/class", listClasses);

export default router;
