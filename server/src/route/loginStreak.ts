import { Hono } from "hono";
import {
  recordLogin,
  getMyStreak,
  getStreakLeaderboard,
  getStreakStats,
  getLoginHistory,
} from "../controller/LoginStreakController";
import { requireAuth } from "../middleware/requireAuth";

const router = new Hono();

router.post("/record", requireAuth, recordLogin);
router.get("/my-streak", requireAuth, getMyStreak);
router.get("/leaderboard/:classId", requireAuth, getStreakLeaderboard);
router.get("/stats", requireAuth, getStreakStats);
router.get("/history", requireAuth, getLoginHistory);

export default router;
