import { Context, Next } from "hono";
import { getTokenPayload } from "../utils/auth";

export const requireAdmin = async (c: Context, next: Next) => {
  const payload = getTokenPayload(c);

  if (!payload) {
    return c.json({ error: "No token provided or invalid token" }, 401);
  }

  if (payload.roleId !== 3) {
    return c.json({ error: "Admin access required" }, 403);
  }

  (c as any).userId = payload.userId;
  return next();
};
