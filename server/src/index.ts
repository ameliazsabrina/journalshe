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

export type Env = {
  CLIENT_URL: string;
  JWT_SECRET: string;
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: [
      "https://journalshe-client.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean),
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
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
