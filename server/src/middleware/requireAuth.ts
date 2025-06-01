import type { Context, Next } from "hono";
import { getTokenPayload } from "../utils/auth";
import type { Env } from "..";

export const requireAuth = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
  const payload = getTokenPayload(c);

  if (!payload) {
    return c.json(
      { error: "Unauthorized: No token provided or invalid token" },
      401
    );
  }

  // Add user info to context for use in route handlers
  (c as any).userId = payload.userId;
  (c as any).userRole = payload.roleId;

  return next();
};

export const requireStudent = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
  const payload = getTokenPayload(c);

  if (!payload) {
    return c.json(
      { error: "Unauthorized: No token provided or invalid token" },
      401
    );
  }

  if (payload.roleId !== 1) {
    return c.json({ error: "Student access required" }, 403);
  }

  (c as any).userId = payload.userId;
  return next();
};

export const requireTeacher = async (
  c: Context<{ Bindings: Env }>,
  next: Next
) => {
  const payload = getTokenPayload(c);

  if (!payload) {
    return c.json(
      { error: "Unauthorized: No token provided or invalid token" },
      401
    );
  }

  if (payload.roleId !== 2) {
    return c.json({ error: "Teacher access required" }, 403);
  }

  (c as any).userId = payload.userId;
  return next();
};
