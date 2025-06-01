import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

const getJWTSecret = () => {
  return process.env.JWT_SECRET as string;
};

export interface JWTPayload {
  userId: string;
  roleId?: number;
}

export const getUserIdFromToken = (c: Context): string | null => {
  try {
    let token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      token = getCookie(c, "token");
    }

    console.log("Token extraction debug:", {
      hasAuthHeader: !!c.req.header("Authorization"),
      hasCookie: !!getCookie(c, "token"),
      tokenFound: !!token,
      tokenLength: token?.length || 0,
    });

    if (!token) return null;

    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    console.log("Token decoded successfully:", { userId: decoded?.userId });
    return decoded?.userId || null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const getTokenPayload = (c: Context): JWTPayload | null => {
  try {
    let token = c.req.header("Authorization")?.split(" ")[1];

    if (!token) {
      token = getCookie(c, "token");
    }

    if (!token) return null;

    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
