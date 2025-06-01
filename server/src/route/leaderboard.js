"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var LeaderboardController_1 = require("../controller/LeaderboardController");
var router = new hono_1.Hono();
router.get("/class/:classId", LeaderboardController_1.getClassLeaderboard);
router.get("/my-ranking", LeaderboardController_1.getMyRanking);
router.post("/update-points", LeaderboardController_1.updateStudentPoints);
router.get(
  "/combined/:classId",
  LeaderboardController_1.getCombinedLeaderboard
);
exports.default = router;
