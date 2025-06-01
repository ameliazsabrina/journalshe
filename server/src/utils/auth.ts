import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

const getJWTSecret = (c: Context<{ Bindings: Env }>) => {
  const secret = c.env?.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

export interface JWTPayload {
  userId: string;
  roleId?: number;
}

export const getUserIdFromToken = (
  c: Context<{ Bindings: Env }>
): string | null => {
  try {
    let token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      token = getCookie(c, "token");
    }

    console.log("Token extraction debug:", {
      hasAuthHeader: !!c.req.header("Authorization"),
      authHeaderValue: c.req.header("Authorization")?.substring(0, 20) + "...",
      hasCookie: !!getCookie(c, "token"),
      cookieValue: getCookie(c, "token")?.substring(0, 20) + "...",
      tokenFound: !!token,
      tokenLength: token?.length || 0,
      allHeaders: Object.fromEntries(c.req.raw.headers.entries()),
    });

    if (!token) {
      console.log("No token found in Authorization header or cookie");
      return null;
    }

    const decoded = jwt.verify(token, getJWTSecret(c)) as JWTPayload;
    console.log("Token decoded successfully:", { userId: decoded?.userId });
    return decoded?.userId || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const getTokenPayload = (
  c: Context<{ Bindings: Env }>
): JWTPayload | null => {
  try {
    let token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      token = getCookie(c, "token");
    }

    if (!token) return null;

    const decoded = jwt.verify(token, getJWTSecret(c)) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
