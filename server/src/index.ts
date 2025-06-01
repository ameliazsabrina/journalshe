import { Hono } from "hono";
import { cors } from "hono/cors";

import auth from "./route/auth";
import assignment from "./route/assignment";
import leaderboard from "./route/leaderboard";
import loginStreak from "./route/loginStreak";
import school from "./route/school";
import student from "./route/student";
import submission from "./route/submission";
import teacher from "./route/teacher";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.route("/api/auth", auth);
app.route("/api/school", school);
app.route("/api/students", student);
app.route("/api/teachers", teacher);
app.route("/api/assignments", assignment);
app.route("/api/submissions", submission);
app.route("/api/leaderboard", leaderboard);
app.route("/api/login-streak", loginStreak);

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
export default { port: 4000, fetch: app.fetch };
