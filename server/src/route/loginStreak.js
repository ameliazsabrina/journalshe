"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var LoginStreakController_1 = require("../controller/LoginStreakController");
var router = new hono_1.Hono();
router.post("/record", LoginStreakController_1.recordLogin);
router.get("/my-streak", LoginStreakController_1.getMyStreak);
router.get("/leaderboard/:classId", LoginStreakController_1.getStreakLeaderboard);
router.get("/stats", LoginStreakController_1.getStreakStats);
router.get("/history", LoginStreakController_1.getLoginHistory);
exports.default = router;
