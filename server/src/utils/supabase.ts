import type { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

export const supabase = (c: Context<{ Bindings: Env }>) => {
  const supabaseUrl =
    c.env?.SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://fdigdwsrqrdzpwlnylog.supabase.co";

  const supabaseKey =
    c.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Supabase configuration debug:", {
    hasCloudflareUrl: !!c.env?.SUPABASE_URL,
    hasProcessUrl: !!process.env.SUPABASE_URL,
    hasCloudflareKey: !!c.env?.SUPABASE_SERVICE_ROLE_KEY,
    hasProcessKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlValue: supabaseUrl,
    keyLength: supabaseKey?.length || 0,
  });

  if (!supabaseKey) {
    console.error("Environment check:", {
      hasCloudflareEnv: !!c.env?.SUPABASE_SERVICE_ROLE_KEY,
      hasProcessEnv: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      envKeys: Object.keys(process.env).filter((key) =>
        key.includes("SUPABASE")
      ),
    });
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is required");
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Supabase client creation error:", error);
    throw error;
  }
};
