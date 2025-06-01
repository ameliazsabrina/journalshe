import type { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import type { Env } from "..";

dotenv.config();

export const supabase = (c: Context<{ Bindings: Env }>) => {
  const supabaseUrl =
    c.env.SUPABASE_URL || "https://fdigdwsrqrdzpwlnylog.supabase.co";
  const supabaseKey = c.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return createClient(supabaseUrl, supabaseKey);
};
