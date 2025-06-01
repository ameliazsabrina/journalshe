"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var cors_1 = require("hono/cors");
var auth_1 = require("./route/auth");
var assignment_1 = require("./route/assignment");
var leaderboard_1 = require("./route/leaderboard");
var loginStreak_1 = require("./route/loginStreak");
var school_1 = require("./route/school");
var student_1 = require("./route/student");
var submission_1 = require("./route/submission");
var teacher_1 = require("./route/teacher");
var app = new hono_1.Hono();
app.use("*", (0, cors_1.cors)({
    origin: "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
}));
app.route("/api/auth", auth_1.default);
app.route("/api/school", school_1.default);
app.route("/api/students", student_1.default);
app.route("/api/teachers", teacher_1.default);
app.route("/api/assignments", assignment_1.default);
app.route("/api/submissions", submission_1.default);
app.route("/api/leaderboard", leaderboard_1.default);
app.route("/api/login-streak", loginStreak_1.default);
app.get("/health", function (c) {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/", function (c) {
    return c.text("Hello Hono!");
});
exports.default = { port: 4000, fetch: app.fetch };
