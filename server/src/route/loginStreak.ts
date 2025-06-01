import { Hono } from "hono";
import {
  recordLogin,
  getMyStreak,
  getStreakLeaderboard,
  getStreakStats,
  getLoginHistory,
} from "../controller/LoginStreakController";

const router = new Hono();

router.post("/record", recordLogin);
router.get("/my-streak", getMyStreak);
router.get("/leaderboard/:classId", getStreakLeaderboard);
router.get("/stats", getStreakStats);
router.get("/history", getLoginHistory);

export default router;
