import type { Context } from "hono";
import { supabase } from "../utils/supabase";
import type { Env } from "..";

export const createSchool = async (c: Context<{ Bindings: Env }>) => {
  const { name, address } = await c.req.json();

  const { data, error } = await supabase(c)
    .from("School")
    .insert([{ name, address }])
    .select()
    .single();

  if (error) {
    console.log("Failed to create school", error?.message);
    return c.json(
      { error: "Failed to create school", details: error.message },
      500
    );
  } else {
    return c.json({ message: "School created", school: data }, 201);
  }
};

export const createClass = async (c: Context<{ Bindings: Env }>) => {
  const { name, schoolId } = await c.req.json();

  const { data: school } = await supabase(c)
    .from("School")
    .select("id")
    .eq("id", schoolId)
    .single();
  if (!school) return c.json({ error: "School not found" }, 404);

  const { data, error } = await supabase(c)
    .from("Class")
    .insert([{ name, schoolId }])
    .select()
    .single();

  if (error)
    return c.json(
      { error: "Failed to create class", details: error.message },
      500
    );

  return c.json({ message: "Class created", class: data }, 201);
};

export const listSchools = async (c: Context<{ Bindings: Env }>) => {
  const { data, error } = await supabase(c).from("School").select("*");
  if (error) return c.json({ error: "Failed to fetch schools" }, 500);

  return c.json(data, 200);
};

export const listClasses = async (c: Context<{ Bindings: Env }>) => {
  const { schoolId } = c.req.query();

  const query = supabase(c).from("Class").select("*");
  if (schoolId) query.eq("schoolId", schoolId as string);

  const { data, error } = await query;

  if (error) return c.json({ error: "Failed to fetch classes" }, 500);

  return c.json(data, 200);
};
