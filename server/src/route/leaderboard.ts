import { Hono } from "hono";
import {
  getClassLeaderboard,
  getMyRanking,
  updateStudentPoints,
  getCombinedLeaderboard,
} from "../controller/LeaderboardController";

const router = new Hono();

router.get("/class/:classId", getClassLeaderboard);
router.get("/my-ranking", getMyRanking);
router.post("/update-points", updateStudentPoints);
router.get("/combined/:classId", getCombinedLeaderboard);

export default router;
