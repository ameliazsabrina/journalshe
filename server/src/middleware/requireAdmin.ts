import type { Context, Next } from "hono";
import { getTokenPayload, getUserIdFromToken } from "../utils/auth";
import type { Env } from "..";

export const requireAdmin = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
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
