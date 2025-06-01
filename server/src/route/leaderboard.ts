import { Hono } from "hono";
import {
  getClassLeaderboard,
  getMyRanking,
  updateStudentPoints,
  getCombinedLeaderboard,
} from "../controller/LeaderboardController";
import { requireAuth } from "../middleware/requireAuth";

const router = new Hono();

router.get("/class/:classId", requireAuth, getClassLeaderboard);
router.get("/my-ranking", requireAuth, getMyRanking);
router.post("/update-points", requireAuth, updateStudentPoints);
router.get("/combined/:classId", requireAuth, getCombinedLeaderboard);

export default router;
